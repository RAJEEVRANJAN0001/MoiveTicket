from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Movie(models.Model):
    """
    Movie model to store movie information.
    """
    title = models.CharField(max_length=200, help_text="Movie title")
    duration_minutes = models.PositiveIntegerField(
        help_text="Duration of the movie in minutes",
        validators=[MinValueValidator(1), MaxValueValidator(600)]
    )
    description = models.TextField(blank=True, help_text="Movie description")
    genre = models.CharField(max_length=100, blank=True, help_text="Movie genre")
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=1, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        help_text="Movie rating out of 10"
    )
    release_date = models.DateField(null=True, blank=True, help_text="Movie release date")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.duration_minutes} mins)"


class Show(models.Model):
    """
    Show model to store movie show information.
    """
    movie = models.ForeignKey(
        Movie, 
        on_delete=models.CASCADE, 
        related_name='shows',
        help_text="Movie being shown"
    )
    screen_name = models.CharField(max_length=100, help_text="Screen/Theater name")
    date_time = models.DateTimeField(help_text="Show date and time")
    total_seats = models.PositiveIntegerField(
        help_text="Total number of seats available",
        validators=[MinValueValidator(1), MaxValueValidator(1000)]
    )
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Ticket price"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date_time']

    def __str__(self):
        return f"{self.movie.title} - {self.screen_name} on {self.date_time}"

    @property
    def available_seats(self):
        """Calculate available seats for this show."""
        booked_seats = self.bookings.filter(status='booked').count()
        return self.total_seats - booked_seats

    @property
    def booked_seat_numbers(self):
        """Get list of booked seat numbers."""
        return list(
            self.bookings.filter(status='booked').values_list('seat_number', flat=True)
        )


class Booking(models.Model):
    """
    Booking model to store seat booking information.
    """
    STATUS_CHOICES = [
        ('booked', 'Booked'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='bookings',
        help_text="User who made the booking"
    )
    show = models.ForeignKey(
        Show, 
        on_delete=models.CASCADE, 
        related_name='bookings',
        help_text="Show for which booking is made"
    )
    seat_number = models.PositiveIntegerField(
        help_text="Seat number (1-based indexing)",
        validators=[MinValueValidator(1)]
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='booked',
        help_text="Booking status"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ensure no duplicate seat booking for the same show
        unique_together = ('show', 'seat_number')
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.id} - {self.user.username} - Seat {self.seat_number}"

    def clean(self):
        """Custom validation for seat number."""
        from django.core.exceptions import ValidationError
        
        if self.seat_number and self.show_id:
            if self.seat_number > self.show.total_seats:
                raise ValidationError(
                    f"Seat number {self.seat_number} exceeds total seats "
                    f"({self.show.total_seats}) for this show."
                )

    def save(self, *args, **kwargs):
        """Override save to include validation."""
        self.clean()
        super().save(*args, **kwargs)