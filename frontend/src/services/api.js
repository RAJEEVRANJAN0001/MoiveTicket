import axios from 'axios';

// Environment-based API URL detection
const getApiUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = getApiUrl();

class ApiService {
  constructor() {
    // Check if demo mode is enabled
    this.useMockData = process.env.REACT_APP_DEMO_MODE === 'true';
    this.backendTested = false;
    
    if (!this.useMockData) {
      this.initializeApi();
    } else {
      console.log('Demo mode enabled - using mock data');
    }
  }

  initializeApi() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5 second timeout
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

    // Response interceptor to handle errors and fallback to mock data
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        // If backend is not available, switch to mock data
        if (this.shouldUseMockData(error)) {
          console.warn('Backend not available, switching to mock data mode');
          this.useMockData = true;
          
          // Retry the request with mock data
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

  shouldUseMockData(error) {
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ETIMEDOUT' ||
      error.message?.includes('Network Error') ||
      error.response?.status >= 500
    );
  }

  async handleMockRequest(originalConfig) {
    const url = originalConfig.url;
    const method = originalConfig.method.toLowerCase();
    const data = originalConfig.data ? JSON.parse(originalConfig.data) : {};

    // Mock login
    if (url.includes('/login/') && method === 'post') {
      return this.mockLogin(data);
    }
    
    // Mock signup
    if (url.includes('/signup/') && method === 'post') {
      return this.mockSignup(data);
    }
    
    // Mock movies
    if (url.includes('/movies/') && method === 'get') {
      return this.mockGetMovies();
    }
    
    // Mock shows
    if (url.includes('/shows/') && method === 'get') {
      return this.mockGetShows(url);
    }
    
    // Mock bookings
    if (url.includes('/book/') && method === 'post') {
      return this.mockBookSeat(data);
    }
    
    // Mock my bookings
    if (url.includes('/my-bookings/') && method === 'get') {
      return this.mockGetMyBookings();
    }

    // Default mock response
    return { data: { message: 'Mock response' } };
  }

  // Mock API methods
  async mockLogin(credentials) {
    if (credentials.username && credentials.password) {
      const mockToken = 'mock-jwt-token-' + Date.now();
      this.setAuthToken(mockToken);
      return {
        data: {
          token: mockToken,
          user: { 
            id: 1, 
            username: credentials.username, 
            email: credentials.email || `${credentials.username}@demo.com` 
          }
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  async mockSignup(userData) {
    if (userData.username && userData.email && userData.password) {
      const mockToken = 'mock-jwt-token-' + Date.now();
      this.setAuthToken(mockToken);
      return {
        data: {
          token: mockToken,
          user: { 
            id: Math.floor(Math.random() * 1000), 
            username: userData.username, 
            email: userData.email 
          }
        }
      };
    } else {
      throw new Error('Please fill all required fields');
    }
  }

  async mockGetMovies() {
    // Try to fetch real movies from OMDB API
    if (process.env.REACT_APP_OMDB_API_KEY && process.env.REACT_APP_OMDB_API_KEY !== 'your_omdb_api_key_here') {
      try {
        const popularMovies = [
          'Avengers: Endgame',
          'The Dark Knight',
          'Inception',
          'Interstellar',
          'The Matrix',
          'Spider-Man: No Way Home',
          'Top Gun: Maverick',
          'Avatar: The Way of Water'
        ];

        const moviePromises = popularMovies.slice(0, 6).map(async (title, index) => {
          try {
            const response = await fetch(
              `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${process.env.REACT_APP_OMDB_API_KEY}`
            );
            const movieData = await response.json();
            
            if (movieData.Response === 'True') {
              return {
                id: index + 1,
                title: movieData.Title,
                genre: movieData.Genre?.split(',')[0] || 'Action',
                duration: movieData.Runtime ? parseInt(movieData.Runtime) : 120,
                rating: movieData.Rated || 'PG-13',
                description: movieData.Plot || 'A thrilling movie experience.',
                poster_url: movieData.Poster !== 'N/A' ? movieData.Poster : `https://via.placeholder.com/300x450/1a1a1a/ffffff?text=${encodeURIComponent(movieData.Title)}`,
                year: movieData.Year,
                director: movieData.Director,
                actors: movieData.Actors,
                imdbRating: movieData.imdbRating
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching movie ${title}:`, error);
            return null;
          }
        });

        const movies = await Promise.all(moviePromises);
        const validMovies = movies.filter(movie => movie !== null);
        
        if (validMovies.length > 0) {
          return { data: { results: validMovies } };
        }
      } catch (error) {
        console.error('Error fetching movies from OMDB:', error);
      }
    }

    // Fallback to sample movies if OMDB fails or no API key
    // Using real movie titles to avoid demo placeholders
    const mockMovies = [
      {
        id: 1,
        title: "Avengers: Endgame",
        genre: "Action",
        duration: 181,
        rating: "PG-13",
        description: "The Avengers assemble once more to reverse Thanos actions and save the universe.",
        poster_url: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Avengers"
      },
      {
        id: 2,
        title: "The Dark Knight",
        genre: "Action",
        duration: 152,
        rating: "PG-13",
        description: "Batman faces his greatest psychological and physical tests when the Joker wreaks havoc.",
        poster_url: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Batman"
      },
      {
        id: 3,
        title: "Inception",
        genre: "Sci-Fi",
        duration: 148,
        rating: "PG-13",
        description: "A thief who steals corporate secrets through dream-sharing technology.",
        poster_url: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Inception"
      }
    ];
    return { data: { results: mockMovies } };
  }

  async mockGetShows(url) {
    const movieId = url.match(/\/movies\/(\d+)\/shows\//)?.[1] || 1;
    const mockShows = [
      {
        id: 1,
        movie: parseInt(movieId),
        movie_title: "Sample Movie",
        screen_name: "Starlight Cinema - IMAX Screen 1",
        date_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        price: 450.00,
        total_seats: 100,
        available_seats: 50,
        booked_seat_numbers: []
      },
      {
        id: 2,
        movie: parseInt(movieId),
        movie_title: "Sample Movie",
        screen_name: "Starlight Cinema - Premium Screen 2", 
        date_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        price: 350.00,
        total_seats: 80,
        available_seats: 30,
        booked_seat_numbers: []
      },
      {
        id: 3,
        movie: parseInt(movieId),
        movie_title: "Sample Movie",
        screen_name: "Starlight Cinema - Standard Screen 3", 
        date_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        price: 250.00,
        total_seats: 90,
        available_seats: 75,
        booked_seat_numbers: []
      }
    ];
    return { data: { results: mockShows } };
  }

  async mockBookSeat(data) {
    return {
      data: {
        id: Math.floor(Math.random() * 1000),
        seat_number: data.seat_number,
        booking_time: new Date().toISOString(),
        status: 'confirmed'
      }
    };
  }

  async mockGetMyBookings() {
    // Get movie titles, if available, otherwise use sensible defaults
    const moviesResponse = await this.mockGetMovies();
    const movies = moviesResponse.data.results || [];

    const movieTitleOrDefault = (index, fallback) => movies[index]?.title || fallback;

    // Create a small set of realistic mock bookings using safe defaults
    const mockBookings = [
      {
        id: 1,
        bookingId: "BK" + Date.now().toString().slice(-6),
        movie_title: movieTitleOrDefault(0, "Avengers: Endgame"),
        theater: { name: "PVR Cinemas - Gold Class" },
        screen_name: "PVR Cinemas - Gold Class",
        showTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('en-IN'),
        show_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        seat_number: "B7",
        selectedSeats: [{ id: "B7", price: 450 }],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        booking_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "confirmed",
        price: 450,
        total_amount: 450,
        screen: "Screen 1"
      },
      {
        id: 2,
        bookingId: "BK" + (Date.now() - 1000).toString().slice(-6),
        movie_title: movieTitleOrDefault(1, "The Dark Knight"),
        theater: { name: "INOX Premium" },
        screen_name: "INOX Premium",
        showTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toLocaleString('en-IN'),
        show_datetime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        seat_number: "C6",
        selectedSeats: [{ id: "C6", price: 350 }],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        booking_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "booked",
        price: 350,
        total_amount: 350,
        screen: "Screen 2"
      }
    ];
    return { data: { results: mockBookings } };
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
      // Reuse the same mock movies from mockGetMovies for consistency
      const response = await this.mockGetMovies();
      return this.getMockResponse(response.data);
    }
    return this.api.get('/movies/');
  }

  async getMovieShows(movieId) {
    if (this.useMockData) {
      const mockShows = [
        {
          id: 1,
          movie: parseInt(movieId),
          movie_title: "Sample Movie",
          screen_name: "Starlight Cinema - IMAX Screen 1",
          date_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          price: 450.00,
          total_seats: 100,
          available_seats: 50,
          booked_seat_numbers: []
        },
        {
          id: 2,
          movie: parseInt(movieId),
          movie_title: "Sample Movie",
          screen_name: "Starlight Cinema - Premium Screen 2",
          date_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
          price: 350.00,
          total_seats: 80,
          available_seats: 30,
          booked_seat_numbers: []
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
      return this.mockGetMyBookings();
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
          movie_title: "Avengers: Endgame",
          theater: "PVR Cinemas - Gold Class",
          showtime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          price: 450,
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