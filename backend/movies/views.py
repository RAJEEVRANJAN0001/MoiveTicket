from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db import transaction, IntegrityError, DatabaseError, OperationalError
import time
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Movie, Show, Booking
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, MovieSerializer,
    ShowSerializer, BookingSerializer, SeatBookingSerializer, UserProfileSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Register a new user",
        responses={201: "User created successfully", 400: "Validation error"}
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User created successfully',
                'user_id': user.id,
                'username': user.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(generics.GenericAPIView):
    """
    User login endpoint with JWT token generation.
    """
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Login user and get JWT tokens",
        responses={
            200: openapi.Response(
                description="Login successful",
                examples={
                    "application/json": {
                        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                        "user": {
                            "id": 1,
                            "username": "testuser",
                            "email": "test@example.com"
                        }
                    }
                }
            ),
            400: "Invalid credentials"
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MovieListView(generics.ListCreateAPIView):
    """
    List all movies or create a new movie.
    """
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    
    def get_permissions(self):
        """Allow GET for everyone, POST only for authenticated users."""
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    @swagger_auto_schema(
        operation_description="Get list of all movies",
        responses={200: MovieSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new movie (Admin only)",
        responses={201: "Movie created", 400: "Validation error", 403: "Admin access required"}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class MovieDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a movie.
    """
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    
    def get_permissions(self):
        """Allow GET for everyone, PUT/DELETE only for admin users."""
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]


class MovieShowsView(generics.ListAPIView):
    """
    List all shows for a specific movie.
    """
    serializer_class = ShowSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        movie_id = self.kwargs['movie_id']
        return Show.objects.filter(movie_id=movie_id).order_by('date_time')

    @swagger_auto_schema(
        operation_description="Get all shows for a specific movie",
        responses={200: ShowSerializer(many=True), 404: "Movie not found"}
    )
    def get(self, request, *args, **kwargs):
        movie_id = self.kwargs['movie_id']
        if not Movie.objects.filter(id=movie_id).exists():
            return Response(
                {'error': 'Movie not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        return super().get(request, *args, **kwargs)


@swagger_auto_schema(
    method='post',
    operation_description="Book a seat for a show",
    request_body=SeatBookingSerializer,
    responses={
        201: openapi.Response(
            description="Seat booked successfully",
            examples={
                "application/json": {
                    "message": "Seat booked successfully",
                    "booking_id": 1,
                    "seat_number": 5,
                    "show_id": 1
                }
            }
        ),
        400: "Validation error or seat already booked",
        404: "Show not found"
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_seat(request, show_id):
    """
    Book a seat for a specific show.
    """
    MAX_ATTEMPTS = 3
    BACKOFF_SECONDS = 0.1

    show = get_object_or_404(Show, id=show_id)

    serializer = SeatBookingSerializer(
        data=request.data,
        context={'show_id': show_id, 'user': request.user}
    )

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    seat_number = serializer.validated_data['seat_number']

    last_exc = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            with transaction.atomic():
                # Lock the show row to avoid concurrent seat checks
                locked_show = Show.objects.select_for_update().get(id=show_id)

                # Double-check seat availability inside the transaction
                existing_booking = Booking.objects.filter(
                    show=locked_show,
                    seat_number=seat_number,
                    status='booked'
                ).exists()

                if existing_booking:
                    return Response(
                        {'error': 'Seat already booked'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Create booking
                booking = Booking.objects.create(
                    user=request.user,
                    show=locked_show,
                    seat_number=seat_number,
                    status='booked'
                )

                return Response({
                    'message': 'Seat booked successfully',
                    'booking_id': booking.id,
                    'seat_number': booking.seat_number,
                    'show_id': locked_show.id,
                    'movie_title': locked_show.movie.title,
                    'show_datetime': locked_show.date_time,
                    'screen_name': locked_show.screen_name
                }, status=status.HTTP_201_CREATED)

        except (IntegrityError, OperationalError, DatabaseError) as exc:
            # Record last exception and retry with backoff for transient DB errors
            last_exc = exc
            if attempt < MAX_ATTEMPTS:
                time.sleep(BACKOFF_SECONDS * attempt)
                continue
            else:
                return Response(
                    {'error': 'Could not complete booking due to a database error. Please try again.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Show.DoesNotExist:
            return Response(
                {'error': 'Show not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception:
            return Response(
                {'error': 'An error occurred while booking the seat'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@swagger_auto_schema(
    method='post',
    operation_description="Cancel a booking",
    responses={
        200: openapi.Response(
            description="Booking cancelled successfully",
            examples={
                "application/json": {
                    "message": "Booking cancelled successfully",
                    "booking_id": 1
                }
            }
        ),
        403: "Cannot cancel other user's booking",
        404: "Booking not found",
        400: "Booking already cancelled"
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    """
    Cancel a booking. Users can only cancel their own bookings.
    """
    try:
        booking = get_object_or_404(Booking, id=booking_id)
        
        # Check if user owns this booking
        if booking.user != request.user:
            return Response(
                {'error': 'You can only cancel your own bookings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if booking is already cancelled
        if booking.status == 'cancelled':
            return Response(
                {'error': 'Booking is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cancel the booking
        booking.status = 'cancelled'
        booking.save()
        
        return Response({
            'message': 'Booking cancelled successfully',
            'booking_id': booking.id,
            'seat_number': booking.seat_number,
            'show_id': booking.show.id
        }, status=status.HTTP_200_OK)
        
    except Booking.DoesNotExist:
        return Response(
            {'error': 'Booking not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


class UserBookingsView(generics.ListAPIView):
    """
    List all bookings for the authenticated user.
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')

    @swagger_auto_schema(
        operation_description="Get all bookings for the authenticated user",
        responses={200: BookingSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ShowListCreateView(generics.ListCreateAPIView):
    """
    List all shows or create a new show.
    """
    queryset = Show.objects.all()
    serializer_class = ShowSerializer
    
    def get_permissions(self):
        """Allow GET for everyone, POST only for admin users."""
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    @swagger_auto_schema(
        operation_description="Get list of all shows",
        responses={200: ShowSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update user profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    @swagger_auto_schema(
        operation_description="Get user profile information",
        responses={200: UserProfileSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)