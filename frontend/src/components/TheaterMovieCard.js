import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Clock, 
  MapPin, 
  Calendar, 
  Play,
  Ticket,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatAmount } from '../utils/helpers';

const TheaterMovieCard = ({ movie, theaters, selectedTheater, index }) => {
  const [showTimes, setShowTimes] = useState(false);

  const generateShowTimes = () => {
    const times = [];
    const currentHour = new Date().getHours();
    
    // Generate realistic show times
    const baseTimes = ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'];
    
    baseTimes.forEach(time => {
      const [hour] = time.split(':');
      const timeHour = parseInt(hour) + (time.includes('PM') && hour !== '12' ? 12 : 0);
      
      if (timeHour > currentHour) {
        times.push({
          time,
          available: Math.random() > 0.3, // 70% chance of availability
          price: Math.floor(Math.random() * 200) + 250 // ₹250-₹450 range
        });
      }
    });
    
    return times;
  };

  const movieShowTimes = generateShowTimes();
  const selectedTheaterData = theaters.find(t => t.id === selectedTheater);

  const handleBookTicket = (time) => {
    toast.success(`Booking ${movie.title} at ${time.time}. Redirecting to seat selection...`);
    
    // Store booking data in localStorage for the booking flow
    const bookingData = {
      movieId: movie.id,
      movieTitle: movie.title,
      theater: selectedTheaterData,
      showTime: time.time,
      price: time.price
    };
    
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    
    // Navigate to seat selection (you'll need to implement this route)
    setTimeout(() => {
      window.location.href = `/booking/seats/${movie.id}`;
    }, 1500);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-dark-900/50 rounded-xl overflow-hidden hover:bg-dark-900/70 transition-all duration-300 group"
    >
      {/* Movie Poster and Info */}
      <div className="relative">
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={movie.poster || '/api/placeholder/300/450'}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = '/api/placeholder/300/450';
            }}
          />
        </div>
        
        {/* Overlay with quick info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center space-x-2 mb-2">
              {movie.isAiPick && (
                <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-full flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Pick</span>
                </span>
              )}
              {movie.rating && (
                <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 text-xs">{movie.rating}</span>
                </div>
              )}
            </div>
            
            <Link
              to={`/movies/${movie.id}`}
              className="inline-flex items-center space-x-1 text-white hover:text-primary-400 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="text-sm">View Details</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Movie Details */}
      <div className="p-4">
        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <span className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{movie.year || '2024'}</span>
          </span>
          
          <span className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(movie.duration)}</span>
          </span>
        </div>

        <div className="mb-3">
          <span className="inline-block px-2 py-1 bg-primary-600/20 text-primary-300 text-xs rounded">
            {movie.genre || 'Drama'}
          </span>
        </div>

        {/* Theater Availability */}
        {selectedTheaterData && (
          <div className="border-t border-gray-700 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300 flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{selectedTheaterData.name}</span>
              </span>
              
              <button
                onClick={() => setShowTimes(!showTimes)}
                className="text-primary-400 text-sm hover:text-primary-300 transition-colors flex items-center space-x-1"
              >
                <span>Show Times</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${showTimes ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {/* Show Times */}
            {showTimes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {movieShowTimes.length > 0 ? (
                  movieShowTimes.map((time, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded ${
                        time.available 
                          ? 'bg-green-600/10 border border-green-600/30' 
                          : 'bg-red-600/10 border border-red-600/30'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${time.available ? 'text-green-400' : 'text-red-400'}`}>
                          {time.time}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatAmount(time.price)}
                        </span>
                      </div>
                      
                      {time.available ? (
                        <button
                          onClick={() => handleBookTicket(time)}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-xs transition-colors flex items-center space-x-1"
                        >
                          <Ticket className="w-3 h-3" />
                          <span>Book</span>
                        </button>
                      ) : (
                        <span className="text-red-400 text-xs">Sold Out</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-2">
                    No shows available today
                  </p>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Quick Book Button */}
        {!selectedTheaterData && (
          <button className="w-full mt-3 bg-gray-600/50 text-gray-400 py-2 rounded cursor-not-allowed text-sm">
            Select a theater to view showtimes
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default TheaterMovieCard;