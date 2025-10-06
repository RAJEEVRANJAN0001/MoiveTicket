from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('signup/', views.UserRegistrationView.as_view(), name='user-signup'),
    path('login/', views.UserLoginView.as_view(), name='user-login'),
    
    # Movie endpoints
    path('movies/', views.MovieListView.as_view(), name='movie-list'),
    path('movies/<int:pk>/', views.MovieDetailView.as_view(), name='movie-detail'),
    path('movies/<int:movie_id>/shows/', views.MovieShowsView.as_view(), name='movie-shows'),
    
    # Show endpoints
    path('shows/', views.ShowListCreateView.as_view(), name='show-list'),
    path('shows/<int:show_id>/book/', views.book_seat, name='book-seat'),
    
    # Booking endpoints
    path('bookings/<int:booking_id>/cancel/', views.cancel_booking, name='cancel-booking'),
    path('my-bookings/', views.UserBookingsView.as_view(), name='user-bookings'),
    
    # User profile
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
]