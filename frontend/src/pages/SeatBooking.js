import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Check, X, CreditCard, MapPin, Star, Monitor, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatAmount } from '../utils/helpers';

const SeatBooking = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLayout, setSeatLayout] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedBooking = localStorage.getItem('currentBooking');
    if (storedBooking) {
      const data = JSON.parse(storedBooking);
      setBookingData(data);
      generateSeatLayout(data.theater.totalSeats);
    } else {
      navigate('/movies');
    }
  }, [movieId, navigate]);

  const generateSeatLayout = (totalSeats) => {
    setLoading(true);
    const rows = Math.ceil(totalSeats / 20);
    const layout = [];
    
    for (let row = 0; row < rows; row++) {
      const seatsInRow = row < 3 ? 16 : 20;
      const rowLetter = String.fromCharCode(65 + row);
      const rowSeats = [];
      
      for (let seat = 1; seat <= seatsInRow; seat++) {
        const seatId = rowLetter + seat;
        const isOccupied = Math.random() < 0.3;
        const isBlocked = Math.random() < 0.05;
        
        rowSeats.push({
          id: seatId,
          row: rowLetter,
          number: seat,
          status: isBlocked ? 'blocked' : (isOccupied ? 'occupied' : 'available'),
          price: row < 3 ? 250 : (row < 6 ? 350 : 450),
          type: row < 3 ? 'standard' : (row < 6 ? 'premium' : 'deluxe')
        });
      }
      
      layout.push({ row: rowLetter, seats: rowSeats });
    }
    
    setSeatLayout(layout);
    setLoading(false);
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'occupied' || seat.status === 'blocked') {
      toast.error('This seat is not available');
      return;
    }

    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 8) {
        toast.error('Maximum 8 seats can be selected');
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    const finalBooking = {
      ...bookingData,
      selectedSeats,
      totalAmount: calculateTotal(),
      bookingId: 'BK' + Date.now(),
      bookingDate: new Date().toISOString()
    };

    localStorage.setItem('finalBooking', JSON.stringify(finalBooking));
    toast.success('Booking confirmed! Redirecting to payment...');
    
    setTimeout(() => {
      navigate('/booking/payment');
    }, 2000);
  };

  const getSeatColor = (seat) => {
    if (selectedSeats.find(s => s.id === seat.id)) {
      return 'bg-primary-500 border-primary-400';
    }
    
    switch (seat.status) {
      case 'occupied':
        return 'bg-red-600 border-red-500 cursor-not-allowed';
      case 'blocked':
        return 'bg-gray-600 border-gray-500 cursor-not-allowed';
      default:
        switch (seat.type) {
          case 'deluxe':
            return 'bg-yellow-600/20 border-yellow-500 hover:bg-yellow-500/30';
          case 'premium':
            return 'bg-purple-600/20 border-purple-500 hover:bg-purple-500/30';
          default:
            return 'bg-green-600/20 border-green-500 hover:bg-green-500/30';
        }
    }
  };

  const getSeatIcon = (seat) => {
    if (seat.status === 'blocked') return React.createElement(X, { className: "w-3 h-3" });
    if (seat.status === 'occupied') return React.createElement(User, { className: "w-3 h-3" });
    if (selectedSeats.find(s => s.id === seat.id)) return React.createElement(Check, { className: "w-3 h-3" });
    return null;
  };

  if (loading || !bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading seat layout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate('/movies')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Movies</span>
          </button>

          <h1 className="text-3xl font-bold text-white">Select Your Seats</h1>
          <div></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-900/50 rounded-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className="font-semibold text-white mb-1">{bookingData.movieTitle}</h3>
              <p className="text-gray-400 text-sm">{bookingData.showTime}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary-400" />
              <div>
                <p className="text-white text-sm">{bookingData.theater.name}</p>
                <p className="text-gray-400 text-xs">{bookingData.theater.location}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="text-white text-sm">Rating: {bookingData.theater.rating}</p>
                <p className="text-gray-400 text-xs">{bookingData.theater.totalSeats} seats</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-white text-sm">{selectedSeats.length} selected</p>
                <p className="text-gray-400 text-xs">Total: {formatAmount(calculateTotal())}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-900/50 rounded-xl p-6"
            >
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-4 rounded-lg">
                    <Monitor className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full mb-2"></div>
                <p className="text-center text-gray-400 text-sm">SCREEN</p>
              </div>

              <div className="space-y-4">
                {seatLayout.map((row, rowIndex) => (
                  <motion.div
                    key={row.row}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + rowIndex * 0.05 }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <div className="w-8 text-center text-gray-400 font-semibold">
                      {row.row}
                    </div>
                    
                    <div className="flex space-x-1">
                      {row.seats.map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          className={'w-8 h-8 rounded border-2 transition-all duration-200 flex items-center justify-center text-white text-xs font-semibold ' + getSeatColor(seat)}
                          disabled={seat.status === 'occupied' || seat.status === 'blocked'}
                          title={seat.id + ' - ' + formatAmount(seat.price) + ' (' + seat.type + ')'}
                        >
                          {getSeatIcon(seat) || seat.number}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <h4 className="text-white font-semibold mb-4">Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-600/20 border border-green-500 rounded"></div>
                    <span className="text-gray-400">Available (₹250)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-600/20 border border-purple-500 rounded"></div>
                    <span className="text-gray-400">Premium (₹350)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-600/20 border border-yellow-500 rounded"></div>
                    <span className="text-gray-400">Deluxe (₹450)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-600 border border-red-500 rounded"></div>
                    <span className="text-gray-400">Occupied</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-primary-500 border border-primary-400 rounded"></div>
                    <span className="text-gray-400">Selected</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-dark-900/50 rounded-xl p-6 sticky top-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Booking Summary</h3>
              
              {selectedSeats.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {selectedSeats.map((seat) => (
                      <div key={seat.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">{seat.id} ({seat.type})</span>
                        <span className="text-white">{formatAmount(seat.price)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-white">Total</span>
                      <span className="text-primary-400 text-lg">{formatAmount(calculateTotal())}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBooking}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Payment</span>
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Select your seats to see the summary
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatBooking;
