import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.removeAuthToken();
          // Only redirect if not on login/signup pages
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    localStorage.setItem('auth-token', token);
    this.api.defaults.headers.Authorization = `Bearer ${token}`;
  }

  removeAuthToken() {
    localStorage.removeItem('auth-token');
    delete this.api.defaults.headers.Authorization;
  }

  // Authentication endpoints
  async login(credentials) {
    return this.api.post('/login/', credentials);
  }

  async signup(userData) {
    return this.api.post('/signup/', userData);
  }

  // Movie endpoints
  async getMovies() {
    return this.api.get('/movies/');
  }

  async getMovieShows(movieId) {
    return this.api.get(`/movies/${movieId}/shows/`);
  }

  // Booking endpoints
  async bookSeat(showId, seatNumber) {
    return this.api.post(`/shows/${showId}/book/`, { seat_number: seatNumber });
  }

  async bookMultipleSeats(showId, seatNumbers) {
    // Book multiple seats sequentially with retry logic
    const results = [];
    const errors = [];

    for (const seatNumber of seatNumbers) {
      try {
        const result = await this.bookSeat(showId, seatNumber);
        results.push({
          seatNumber,
          success: true,
          booking: result.data,
        });
      } catch (error) {
        errors.push({
          seatNumber,
          success: false,
          error: error.response?.data?.error || 'Booking failed',
        });
      }
    }

    return {
      results,
      errors,
      successCount: results.length,
      errorCount: errors.length,
    };
  }

  async getMyBookings() {
    return this.api.get('/my-bookings/');
  }

  async cancelBooking(bookingId) {
    return this.api.post(`/bookings/${bookingId}/cancel/`);
  }

  // Show endpoints
  async getShows() {
    return this.api.get('/shows/');
  }
}

const apiService = new ApiService();
export default apiService;