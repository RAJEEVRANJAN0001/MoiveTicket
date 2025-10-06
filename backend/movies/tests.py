from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime, timedelta
from django.utils import timezone

from .models import Movie, Show, Booking


class MovieModelTest(TestCase):
    """Test cases for Movie model."""

    def setUp(self):
        self.movie = Movie.objects.create(
            title="Test Movie",
            duration_minutes=120,
            genre="Action",
            rating=8.5
        )

    def test_movie_str_representation(self):
        """Test string representation of movie."""
        expected = "Test Movie (120 mins)"
        self.assertEqual(str(self.movie), expected)

    def test_movie_creation(self):
        """Test movie creation."""
        self.assertEqual(self.movie.title, "Test Movie")
        self.assertEqual(self.movie.duration_minutes, 120)
        self.assertEqual(self.movie.genre, "Action")
        self.assertEqual(self.movie.rating, 8.5)


class ShowModelTest(TestCase):
    """Test cases for Show model."""

    def setUp(self):
        self.movie = Movie.objects.create(
            title="Test Movie",
            duration_minutes=120
        )
        self.show = Show.objects.create(
            movie=self.movie,
            screen_name="Screen 1",
            date_time=timezone.now() + timedelta(days=1),
            total_seats=100,
            price=250.00
        )

    def test_show_str_representation(self):
        """Test string representation of show."""
        expected = f"{self.movie.title} - Screen 1 on {self.show.date_time}"
        self.assertEqual(str(self.show), expected)

    def test_available_seats_property(self):
        """Test available seats calculation."""
        self.assertEqual(self.show.available_seats, 100)
        
        # Create a booking
        user = User.objects.create_user(username='testuser', password='testpass')
        Booking.objects.create(
            user=user,
            show=self.show,
            seat_number=1,
            status='booked'
        )
        
        # Refresh from database
        self.show.refresh_from_db()
        self.assertEqual(self.show.available_seats, 99)


class BookingModelTest(TestCase):
    """Test cases for Booking model."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass'
        )
        self.movie = Movie.objects.create(
            title="Test Movie",
            duration_minutes=120
        )
        self.show = Show.objects.create(
            movie=self.movie,
            screen_name="Screen 1",
            date_time=timezone.now() + timedelta(days=1),
            total_seats=100,
            price=250.00
        )

    def test_booking_creation(self):
        """Test booking creation."""
        booking = Booking.objects.create(
            user=self.user,
            show=self.show,
            seat_number=1,
            status='booked'
        )
        self.assertEqual(booking.user, self.user)
        self.assertEqual(booking.show, self.show)
        self.assertEqual(booking.seat_number, 1)
        self.assertEqual(booking.status, 'booked')

    def test_unique_seat_constraint(self):
        """Test that same seat cannot be booked twice."""
        Booking.objects.create(
            user=self.user,
            show=self.show,
            seat_number=1,
            status='booked'
        )
        
        # Try to book the same seat again
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Booking.objects.create(
                user=self.user,
                show=self.show,
                seat_number=1,
                status='booked'
            )


class AuthenticationAPITest(APITestCase):
    """Test cases for authentication APIs."""

    def test_user_registration(self):
        """Test user registration."""
        url = reverse('user-signup')
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='testuser').exists())

    def test_user_login(self):
        """Test user login."""
        # Create user first
        user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        
        url = reverse('user-login')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)


class MovieAPITest(APITestCase):
    """Test cases for movie APIs."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.movie = Movie.objects.create(
            title="Test Movie",
            duration_minutes=120,
            genre="Action"
        )

    def test_movie_list(self):
        """Test movie list API."""
        url = reverse('movie-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_movie_detail(self):
        """Test movie detail API."""
        url = reverse('movie-detail', kwargs={'pk': self.movie.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Test Movie")


class BookingAPITest(APITestCase):
    """Test cases for booking APIs."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.movie = Movie.objects.create(
            title="Test Movie",
            duration_minutes=120
        )
        self.show = Show.objects.create(
            movie=self.movie,
            screen_name="Screen 1",
            date_time=timezone.now() + timedelta(days=1),
            total_seats=100,
            price=250.00
        )
        
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

    def authenticate(self):
        """Authenticate the test client."""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)

    def test_book_seat_success(self):
        """Test successful seat booking."""
        self.authenticate()
        url = reverse('book-seat', kwargs={'show_id': self.show.id})
        data = {'seat_number': 1}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Booking.objects.filter(
            user=self.user,
            show=self.show,
            seat_number=1
        ).exists())

    def test_book_already_booked_seat(self):
        """Test booking an already booked seat."""
        # Book seat first
        Booking.objects.create(
            user=self.user,
            show=self.show,
            seat_number=1,
            status='booked'
        )
        
        self.authenticate()
        url = reverse('book-seat', kwargs={'show_id': self.show.id})
        data = {'seat_number': 1}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_book_seat_without_authentication(self):
        """Test booking without authentication."""
        url = reverse('book-seat', kwargs={'show_id': self.show.id})
        data = {'seat_number': 1}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cancel_booking_success(self):
        """Test successful booking cancellation."""
        booking = Booking.objects.create(
            user=self.user,
            show=self.show,
            seat_number=1,
            status='booked'
        )
        
        self.authenticate()
        url = reverse('cancel-booking', kwargs={'booking_id': booking.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'cancelled')

    def test_cancel_other_user_booking(self):
        """Test cancelling another user's booking."""
        other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123'
        )
        booking = Booking.objects.create(
            user=other_user,
            show=self.show,
            seat_number=1,
            status='booked'
        )
        
        self.authenticate()
        url = reverse('cancel-booking', kwargs={'booking_id': booking.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_bookings_list(self):
        """Test user bookings list API."""
        Booking.objects.create(
            user=self.user,
            show=self.show,
            seat_number=1,
            status='booked'
        )
        
        self.authenticate()
        url = reverse('user-bookings')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)