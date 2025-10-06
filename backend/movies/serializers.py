from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import transaction
from .models import Movie, Show, Booking


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def validate_email(self, value):
        """Check if email already exists."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value

    def create(self, validated_data):
        """Create a new user."""
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'})

    def validate(self, attrs):
        """Authenticate user credentials."""
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password.')


class MovieSerializer(serializers.ModelSerializer):
    """
    Serializer for Movie model.
    """
    shows_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'duration_minutes', 'description', 
            'genre', 'rating', 'release_date', 'shows_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_shows_count(self, obj):
        """Get total number of shows for this movie."""
        return obj.shows.count()


class ShowSerializer(serializers.ModelSerializer):
    """
    Serializer for Show model.
    """
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    available_seats = serializers.ReadOnlyField()
    booked_seat_numbers = serializers.ReadOnlyField()
    
    class Meta:
        model = Show
        fields = [
            'id', 'movie', 'movie_title', 'screen_name', 'date_time', 
            'total_seats', 'available_seats', 'price', 'booked_seat_numbers',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')


class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer for Booking model.
    """
    user_name = serializers.CharField(source='user.username', read_only=True)
    movie_title = serializers.CharField(source='show.movie.title', read_only=True)
    show_datetime = serializers.DateTimeField(source='show.date_time', read_only=True)
    screen_name = serializers.CharField(source='show.screen_name', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_name', 'show', 'movie_title', 
            'show_datetime', 'screen_name', 'seat_number', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def validate_seat_number(self, value):
        """Validate seat number is within show capacity."""
        show = self.initial_data.get('show') or (self.instance.show if self.instance else None)
        if show:
            if isinstance(show, str):
                try:
                    show = Show.objects.get(id=int(show))
                except (Show.DoesNotExist, ValueError):
                    raise serializers.ValidationError("Invalid show.")
            
            if value > show.total_seats:
                raise serializers.ValidationError(
                    f"Seat number {value} exceeds total seats ({show.total_seats}) for this show."
                )
        return value

    def validate(self, attrs):
        """Validate booking constraints."""
        show = attrs.get('show')
        seat_number = attrs.get('seat_number')
        
        if show and seat_number:
            # Check if seat is already booked (excluding current booking if updating)
            existing_booking = Booking.objects.filter(
                show=show, 
                seat_number=seat_number, 
                status='booked'
            )
            
            if self.instance:
                existing_booking = existing_booking.exclude(id=self.instance.id)
            
            if existing_booking.exists():
                raise serializers.ValidationError("This seat is already booked.")
        
        return attrs


class SeatBookingSerializer(serializers.Serializer):
    """
    Serializer for seat booking request.
    """
    seat_number = serializers.IntegerField(min_value=1)

    def validate_seat_number(self, value):
        """Validate seat number against show capacity."""
        show_id = self.context.get('show_id')
        if show_id:
            try:
                show = Show.objects.get(id=show_id)
                if value > show.total_seats:
                    raise serializers.ValidationError(
                        f"Seat number {value} exceeds total seats ({show.total_seats}) for this show."
                    )
                
                # Check if seat is already booked
                if Booking.objects.filter(
                    show=show, 
                    seat_number=value, 
                    status='booked'
                ).exists():
                    raise serializers.ValidationError("This seat is already booked.")
                    
            except Show.DoesNotExist:
                raise serializers.ValidationError("Invalid show.")
        return value

    def create(self, validated_data):
        """Create a new booking with transaction safety."""
        show_id = self.context.get('show_id')
        user = self.context.get('user')
        
        try:
            with transaction.atomic():
                show = Show.objects.select_for_update().get(id=show_id)
                
                # Double-check seat availability within transaction
                if Booking.objects.filter(
                    show=show,
                    seat_number=validated_data['seat_number'],
                    status='booked'
                ).exists():
                    raise serializers.ValidationError("Seat already booked.")
                
                # Create the booking
                booking = Booking.objects.create(
                    user=user,
                    show=show,
                    seat_number=validated_data['seat_number'],
                    status='booked'
                )
                return booking
                
        except Show.DoesNotExist:
            raise serializers.ValidationError("Show not found.")


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information.
    """
    bookings_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bookings_count']
        read_only_fields = ['id', 'username']

    def get_bookings_count(self, obj):
        """Get total number of bookings for this user."""
        return obj.bookings.filter(status='booked').count()