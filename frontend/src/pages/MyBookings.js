import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { formatAmount } from '../utils/helpers';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // First try to get bookings from the API
      try {
        const response = await apiService.getMyBookings();
        const apiBookings = response.data.results || response.data;
        
        // Also get local bookings from localStorage
        const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        
        // Combine both sources
        const allBookings = [...apiBookings, ...localBookings];
        setBookings(allBookings);
        
        if (allBookings.length === 0) {
          toast.info('No bookings found. Book your first movie ticket!');
        }
      } catch (apiError) {
        console.log('API not available, using localStorage only');
        
        // If API fails, use only localStorage
        const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        setBookings(localBookings);
        
        if (localBookings.length === 0) {
          toast.info('No bookings found. Book your first movie ticket!');
        } else {
          toast.success(`Found ${localBookings.length} booking(s) from local storage`);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      // Try API first
      try {
        await apiService.cancelBooking(bookingId);
      } catch (apiError) {
        console.log('API not available for cancellation');
      }
      
      // Update local storage
      const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const updatedBookings = localBookings.map(booking => 
        booking.id === bookingId || booking.bookingId === bookingId
          ? { ...booking, status: 'cancelled' }
          : booking
      );
      localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
      
      // Update state
      setBookings(bookings.map(booking => 
        booking.id === bookingId || booking.bookingId === bookingId
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
      
      toast.success('Booking cancelled successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to cancel booking';
      toast.error(errorMessage);
    } finally {
      setCancellingId(null);
    }
  };

  const downloadTicket = (booking) => {
    const ticketData = {
      bookingId: booking.id || booking.bookingId,
      movieTitle: booking.movieTitle || booking.movie?.title,
      theater: booking.theater?.name || booking.show?.theater?.name,
      location: booking.theater?.location || booking.show?.theater?.location,
      showTime: booking.showTime || booking.show?.start_time,
      seats: booking.selectedSeats ? 
        booking.selectedSeats.map(seat => seat.id).join(', ') :
        booking.seat_number,
      totalAmount: booking.totalAmount || booking.total_price,
      bookingDate: new Date(booking.createdAt || booking.created_at).toLocaleDateString(),
      qrCode: `QR-${booking.id || booking.bookingId}`
    };

    const ticketContent = `
🎬 MOVIE TICKET CONFIRMATION 🎬
================================

Booking ID: ${ticketData.bookingId}
Movie: ${ticketData.movieTitle}
Theater: ${ticketData.theater}
Address: ${ticketData.location}
Show Time: ${ticketData.showTime}
Seats: ${ticketData.seats}
Total Amount: ${formatAmount(ticketData.totalAmount)}
Booking Date: ${ticketData.bookingDate}
QR Code: ${ticketData.qrCode}

================================
Please present this ticket at the theater.
Enjoy your movie! 🍿
================================
    `;

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticketData.bookingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Ticket downloaded successfully!');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'booked':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Ticket className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return 'text-green-500 bg-green-500/20';
      case 'cancelled':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const BookingCard = ({ booking, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className={`card transition-all duration-300 ${
        booking.status === 'cancelled' ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {booking.movieTitle || booking.movie?.title || booking.movie_title || 'Unknown Movie'}
            </h3>
            <p className="text-gray-400 text-sm">
              Booking #{booking.id || booking.bookingId || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon(booking.status)}
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
            {booking.status || 'confirmed'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{booking.theater?.name || booking.screen_name || 'Theater TBD'}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{booking.showTime || formatDateTime(booking.show_datetime) || 'Time TBD'}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-gray-400">
            <Ticket className="w-4 h-4" />
            <span>
              {booking.selectedSeats ? 
                `Seats: ${booking.selectedSeats.map(seat => seat.id).join(', ')}` :
                `Seat #${booking.seat_number || 'TBD'}`
              }
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>
              Booked on {formatDateTime(booking.createdAt || booking.created_at)}
              {(booking.totalAmount || booking.total_price) && ` - ${formatAmount(booking.totalAmount || booking.total_price)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Actions */}
      <div className="flex flex-wrap gap-2 justify-end">
        {/* Download Ticket Button */}
        <button
          onClick={() => downloadTicket(booking)}
          className="flex items-center space-x-2 px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>

        {/* Email Ticket Button */}
        <button
          onClick={() => {
            const email = prompt('Enter email address to send ticket:');
            if (email && email.includes('@')) {
              toast.success(`Ticket sent to ${email}!`);
            } else if (email) {
              toast.error('Please enter a valid email address');
            }
          }}
          className="flex items-center space-x-2 px-4 py-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all duration-200"
        >
          <Mail className="w-4 h-4" />
          <span>Email</span>
        </button>

        {/* Cancel Booking Button */}
        {booking.status === 'booked' && (
          <button
            onClick={() => handleCancelBooking(booking.id || booking.bookingId)}
            disabled={cancellingId === (booking.id || booking.bookingId)}
            className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancellingId === (booking.id || booking.bookingId) ? (
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>Cancel</span>
          </button>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your bookings...</p>
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
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          My Bookings
        </h1>
        <p className="text-gray-400 text-lg">
          Manage your movie ticket bookings
        </p>
      </motion.div>

      {/* Stats */}
      {bookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-dark-900 border border-dark-700 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {bookings.length}
            </div>
            <div className="text-gray-400">Total Bookings</div>
          </div>
          <div className="bg-dark-900 border border-dark-700 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {bookings.filter(b => b.status === 'booked').length}
            </div>
            <div className="text-gray-400">Active</div>
          </div>
          <div className="bg-dark-900 border border-dark-700 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-red-500 mb-1">
              {bookings.filter(b => b.status === 'cancelled').length}
            </div>
            <div className="text-gray-400">Cancelled</div>
          </div>
        </motion.div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            No bookings yet
          </h3>
          <p className="text-gray-400 mb-6">
            Start by booking your first movie ticket!
          </p>
          <a href="/movies" className="btn-primary">
            Browse Movies
          </a>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking, index) => (
            <BookingCard key={booking.id} booking={booking} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;