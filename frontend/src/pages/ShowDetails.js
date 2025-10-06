import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import movieDataService from '../services/movieData';
import useAuthStore from '../store/authStore';
import MovieHero from '../components/MovieHero';
import MultiSeatSelector from '../components/MultiSeatSelector';
import { formatDateTime } from '../utils/helpers';

const ShowDetails = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchMovieShows();
  }, [fetchMovieShows]);

  const fetchMovieShows = useCallback(async () => {
    try {
      const [moviesResponse, showsResponse] = await Promise.all([
        apiService.getMovies(),
        apiService.getMovieShows(movieId)
      ]);
      
      const moviesData = moviesResponse.data.results || moviesResponse.data;
      let currentMovie = moviesData.find(m => m.id === parseInt(movieId));
      
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
      setShows(showsResponse.data.results || showsResponse.data);
    } catch (error) {
      toast.error('Failed to fetch show details');
      console.error('Error fetching shows:', error);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  const handleShowSelect = (show) => {
    setSelectedShow(show);
    setSelectedSeats([]);
  };

  const handleSeatsSelect = (seats) => {
    setSelectedSeats(seats);
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
                    <h3 className="text-lg font-semibold text-white">{show.theater}</h3>
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
          <MultiSeatSelector
            show={selectedShow}
            movie={movie}
            selectedSeats={selectedSeats}
            onSeatsChange={handleSeatsSelect}
            onBooking={handleBooking}
            bookingLoading={bookingLoading}
          />
        )}
      </motion.div>
    </div>
  );
};

export default ShowDetails;