import axios from 'axios';

// Environment-based API URL detection
const getApiUrl = () => {
  // If in production and no backend URL is provided, use mock data
  if (process.env.NODE_ENV === 'production' && 
      (!process.env.REACT_APP_API_URL || 
       process.env.REACT_APP_API_URL.includes('your-backend-url'))) {
    return null; // Will use mock data
  }
  return process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = getApiUrl();

class ApiService {
  constructor() {
    this.useMockData = API_BASE_URL === null;
    
    if (!this.useMockData) {
      this.api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
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
          
          // If backend is not available, switch to mock data
          if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            console.warn('Backend not available, switching to mock data mode');
            this.useMockData = true;
            return this.handleMockRequest(error.config);
          }
          
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
  }

  setAuthToken(token) {
    localStorage.setItem('auth-token', token);
    if (this.api) {
      this.api.defaults.headers.Authorization = `Bearer ${token}`;
    }
  }

  removeAuthToken() {
    localStorage.removeItem('auth-token');
    if (this.api) {
      delete this.api.defaults.headers.Authorization;
    }
  }

  // Mock data for demo purposes
  getMockResponse(data) {
    return new Promise(resolve => {
      setTimeout(() => resolve({ data }), 500); // Simulate network delay
    });
  }

  // Authentication endpoints
  async login(credentials) {
    if (this.useMockData) {
      // Mock login for demo
      if (credentials.username && credentials.password) {
        const mockToken = 'mock-jwt-token-' + Date.now();
        this.setAuthToken(mockToken);
        return this.getMockResponse({
          token: mockToken,
          user: { id: 1, username: credentials.username, email: credentials.email || `${credentials.username}@demo.com` }
        });
      } else {
        throw new Error('Invalid credentials');
      }
    }
    return this.api.post('/login/', credentials);
  }

  async signup(userData) {
    if (this.useMockData) {
      // Mock signup for demo
      if (userData.username && userData.email && userData.password) {
        const mockToken = 'mock-jwt-token-' + Date.now();
        this.setAuthToken(mockToken);
        return this.getMockResponse({
          token: mockToken,
          user: { id: Math.floor(Math.random() * 1000), username: userData.username, email: userData.email }
        });
      } else {
        throw new Error('Please fill all required fields');
      }
    }
    return this.api.post('/signup/', userData);
  }

  // Movie endpoints
  async getMovies() {
    if (this.useMockData) {
      const mockMovies = [
        {
          id: 1,
          title: "Demo Movie 1",
          genre: "Action",
          duration: 120,
          rating: "PG-13",
          description: "This is a demo movie for testing purposes.",
          poster_url: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Demo+Movie+1"
        },
        {
          id: 2,
          title: "Demo Movie 2",
          genre: "Comedy",
          duration: 105,
          rating: "PG",
          description: "Another demo movie for testing purposes.",
          poster_url: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Demo+Movie+2"
        }
      ];
      return this.getMockResponse({ results: mockMovies });
    }
    return this.api.get('/movies/');
  }

  async getMovieShows(movieId) {
    if (this.useMockData) {
      const mockShows = [
        {
          id: 1,
          movie: parseInt(movieId),
          theater: "Demo Theater 1",
          showtime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          price: 12.50,
          available_seats: 50
        },
        {
          id: 2,
          movie: parseInt(movieId),
          theater: "Demo Theater 2",
          showtime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
          price: 15.00,
          available_seats: 30
        }
      ];
      return this.getMockResponse({ results: mockShows });
    }
    return this.api.get(`/movies/${movieId}/shows/`);
  }

  // Booking endpoints
  async bookSeat(showId, seatNumber) {
    if (this.useMockData) {
      return this.getMockResponse({
        id: Math.floor(Math.random() * 1000),
        show: showId,
        seat_number: seatNumber,
        booking_time: new Date().toISOString(),
        status: 'confirmed'
      });
    }
    return this.api.post(`/shows/${showId}/book/`, { seat_number: seatNumber });
  }

  async bookMultipleSeats(showId, seatNumbers) {
    if (this.useMockData) {
      // Mock multiple seat booking
      const bookings = seatNumbers.map(seatNumber => ({
        id: Math.floor(Math.random() * 1000),
        show: showId,
        seat_number: seatNumber,
        booking_time: new Date().toISOString(),
        status: 'confirmed'
      }));
      return this.getMockResponse({ bookings, message: `Successfully booked ${seatNumbers.length} seats` });
    }

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
    if (this.useMockData) {
      const mockBookings = [
        {
          id: 1,
          movie_title: "Demo Movie 1",
          theater: "Demo Theater 1",
          showtime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          seat_number: "A1",
          booking_time: new Date().toISOString(),
          status: "confirmed"
        }
      ];
      return this.getMockResponse({ results: mockBookings });
    }
    return this.api.get('/my-bookings/');
  }

  async cancelBooking(bookingId) {
    if (this.useMockData) {
      return this.getMockResponse({ message: "Booking cancelled successfully" });
    }
    return this.api.post(`/bookings/${bookingId}/cancel/`);
  }

  // Show endpoints
  async getShows() {
    if (this.useMockData) {
      const mockShows = [
        {
          id: 1,
          movie_title: "Demo Movie 1",
          theater: "Demo Theater 1",
          showtime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          price: 12.50,
          available_seats: 50
        }
      ];
      return this.getMockResponse({ results: mockShows });
    }
    return this.api.get('/shows/');
  }
}

const apiService = new ApiService();
export default apiService;