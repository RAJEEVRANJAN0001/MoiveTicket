import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import movieDataService from '../services/movieDataService';
import useAuthStore from '../store/authStore';
import MovieHero from '../components/MovieHero';
import MultiSeatSelector from '../components/MultiSeatSelector';
import { formatDateTime } from '../utils/helpers';

const ShowDetails = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  // Add initial debug logging
  console.log('ShowDetails component rendering, movieId:', movieId);
  console.log('Environment variables:', {
    demoMode: process.env.REACT_APP_DEMO_MODE,
    apiUrl: process.env.REACT_APP_API_URL,
    nodeEnv: process.env.NODE_ENV
  });
  
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchMovieShows = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching movie shows for movieId:', movieId);
      console.log('Demo mode:', process.env.REACT_APP_DEMO_MODE);
      console.log('API URL:', process.env.REACT_APP_API_URL);
      
      // Safety check for movieId
      if (!movieId) {
        throw new Error('Movie ID is required');
      }
      
      const [moviesResponse, showsResponse] = await Promise.all([
        apiService.getMovies(),
        apiService.getMovieShows(movieId)
      ]);
      
      console.log('Movies response:', moviesResponse);
      console.log('Shows response:', showsResponse);
      
      const moviesData = moviesResponse.data.results || moviesResponse.data;
      let currentMovie = moviesData.find(m => m.id === parseInt(movieId));
      
      console.log('Current movie found:', currentMovie);
      
      // If movie not found, create a fallback
      if (!currentMovie) {
        currentMovie = {
          id: parseInt(movieId),
          title: 'Movie Details Loading...',
          genre: 'Action',
          duration: 120,
          rating: 'PG-13',
          description: 'Movie details will be loaded shortly.',
          poster_url: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Movie'
        };
      }
      
      // Enhance movie with RapidAPI data if available
      if (currentMovie && process.env.REACT_APP_RAPIDAPI_KEY && process.env.REACT_APP_RAPIDAPI_KEY !== 'your_rapidapi_key_here') {
        try {
          const enhanced = await movieDataService.enhanceMoviesData([currentMovie]);
          currentMovie = enhanced[0];
        } catch (error) {
          console.error('Failed to enhance movie data:', error);
        }
      }
      
      setMovie(currentMovie);
      
      const showsData = showsResponse.data.results || showsResponse.data || [];
      console.log('Shows set:', showsData);
      
      // If no shows available, provide fallback
      if (showsData.length === 0) {
        const fallbackShows = [
          {
            id: 1,
            movie: parseInt(movieId),
            screen_name: 'Starlight Cinema - Screen 1',
            date_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            price: 350,
            total_seats: 100,
            available_seats: 50,
            booked_seat_numbers: []
          },
          {
            id: 2,
            movie: parseInt(movieId),
            screen_name: 'Starlight Cinema - Screen 2',
            date_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
            price: 450,
            total_seats: 80,
            available_seats: 30,
            booked_seat_numbers: []
          }
        ];
        setShows(fallbackShows);
      } else {
        setShows(showsData);
      }
      
    } catch (error) {
      console.error('Error fetching shows:', error);
      toast.error('Failed to fetch show details');
      
      // Provide complete fallback data to prevent blank page
      setMovie({
        id: parseInt(movieId) || 1,
        title: 'Sample Movie',
        genre: 'Action',
        duration: 120,
        rating: 'PG-13',
        description: 'Movie details will be loaded shortly.',
        poster_url: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Movie'
      });
      
      setShows([
        {
          id: 1,
          movie: parseInt(movieId) || 1,
          screen_name: 'Starlight Cinema - Screen 1',
          date_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          price: 350,
          total_seats: 100,
          available_seats: 50,
          booked_seat_numbers: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchMovieShows();
  }, [fetchMovieShows]);

  const handleShowSelect = (show) => {
    setSelectedShow(show);
    setSelectedSeats([]);
  };

  const handleSeatsSelect = (seats) => {
    setSelectedSeats(seats);
  };

  const handleSeatBookingPage = () => {
    if (!selectedShow) {
      toast.error('Please select a show first');
      return;
    }

    // Store booking data for the SeatBooking page
    const bookingData = {
      movieId: movie.id,
      movieTitle: movie.title,
      showId: selectedShow.id,
      showTime: selectedShow.date_time,
      theater: {
        name: selectedShow.screen_name,
        location: "Cinema Location",
        totalSeats: selectedShow.total_seats
      },
      price: selectedShow.price
    };
    
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    navigate(`/booking/seats/${movie.id}`);
  };

  const handleBooking = async () => {
    if (!selectedShow || selectedSeats.length === 0) {
      toast.error('Please select a show and at least one seat');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please log in to book tickets');
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      // Use the enhanced API service for multiple seat booking
      await apiService.bookMultipleSeats(selectedShow.id, selectedSeats);
      toast.success(`${selectedSeats.length} seat(s) booked successfully!`);
      
      // Refresh show data to update available seats
      await fetchMovieShows();
      setSelectedSeats([]);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to book seats';
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading show details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Movie not found</h2>
          <button onClick={() => navigate('/movies')} className="btn-primary">
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
      {/* Back Button */}
      <button
        onClick={() => navigate('/movies')}
        className="btn-ghost mb-6 flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Movies</span>
      </button>

      {/* Movie Hero Section */}
      <MovieHero movie={movie} onBookNow={() => {
        if (shows.length > 0) {
          handleShowSelect(shows[0]);
        }
      }} />
      </motion.div>

      {/* Shows Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="space-y-8"
      >
        <h2 className="text-2xl font-bold text-white">Available Shows</h2>

        {shows.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No shows available</h3>
            <p className="text-gray-400">Check back later for new showtimes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {shows.map((show) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`card cursor-pointer transition-all duration-300 ${
                  selectedShow?.id === show.id 
                    ? 'ring-2 ring-primary-500 bg-primary-600/10' 
                    : 'hover:bg-dark-800'
                }`}
                onClick={() => handleShowSelect(show)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{show.screen_name || show.theater}</h3>
                    <span className="text-2xl font-bold text-primary-500">
                      ₹{show.price}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateTime(show.date_time)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{show.available_seats} of {show.total_seats} seats available</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(show.available_seats / show.total_seats) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Multi-Seat Selection */}
        {selectedShow && (
          <div className="space-y-6">
            {/* Option to use dedicated seat booking page */}
            <div className="text-center">
              <button
                onClick={handleSeatBookingPage}
                className="btn-secondary mr-4"
              >
                Open Full Seat Map
              </button>
              <span className="text-gray-400 text-sm">or select seats below</span>
            </div>
            
            <MultiSeatSelector
              show={selectedShow}
              selectedSeats={selectedSeats}
              onSeatsChange={handleSeatsSelect}
              onBooking={handleBooking}
              isBookingLoading={bookingLoading}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ShowDetails;