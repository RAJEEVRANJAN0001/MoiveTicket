import React, { useState } from 'react';
import { formatAmount } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Minus, Plus, X } from 'lucide-react';
import { generateSeatLayout, calculateTotalPrice, formatSeatNumbers } from '../utils/helpers';

const MultiSeatSelector = ({ 
  show, 
  selectedSeats, 
  onSeatsChange, 
  maxSeats = 10,
  onBooking,
  isBookingLoading 
}) => {
  const [seatCount, setSeatCount] = useState(1);
  
  const seatLayout = generateSeatLayout(
    show.total_seats, 
    show.booked_seat_numbers || [], 
    selectedSeats
  );

  const handleSeatClick = (seatNumber, isBooked, isSelected) => {
    if (isBooked) return;
    
    if (isSelected) {
      // Remove seat from selection
      onSeatsChange(selectedSeats.filter(seat => seat !== seatNumber));
    } else {
      // Add seat to selection (with limit check)
      if (selectedSeats.length < maxSeats && selectedSeats.length < seatCount) {
        onSeatsChange([...selectedSeats, seatNumber]);
      }
    }
  };

  const handleSeatCountChange = (newCount) => {
    const count = Math.max(1, Math.min(newCount, maxSeats));
    setSeatCount(count);
    
    // If we reduce the count below current selection, remove excess seats
    if (selectedSeats.length > count) {
      onSeatsChange(selectedSeats.slice(0, count));
    }
  };

  const clearSelection = () => {
    onSeatsChange([]);
  };

  const totalPrice = calculateTotalPrice(selectedSeats, show.price);

  return (
    <div className="space-y-6">
      {/* Seat Count Selector */}
      <div className="flex items-center justify-between bg-dark-800 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <Users className="w-5 h-5 text-gray-400" />
          <span className="text-white font-medium">Number of Tickets:</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSeatCountChange(seatCount - 1)}
            disabled={seatCount <= 1}
            className="w-8 h-8 flex items-center justify-center bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors duration-200"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
          <span className="w-8 text-center text-white font-bold text-lg">
            {seatCount}
          </span>
          <button
            onClick={() => handleSeatCountChange(seatCount + 1)}
            disabled={seatCount >= maxSeats}
            className="w-8 h-8 flex items-center justify-center bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors duration-200"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Seat Selection Status */}
      {selectedSeats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-600/20 border border-primary-600/50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">
                Selected: {formatSeatNumbers(selectedSeats)}
              </p>
              <p className="text-gray-400 text-sm">
                {selectedSeats.length} of {seatCount} seats selected
              </p>
            </div>
            <button
              onClick={clearSelection}
              className="text-red-400 hover:text-red-300 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Seat Map */}
      <div className="bg-dark-800 rounded-lg p-6">
        {/* Screen */}
        <div className="text-center mb-8">
          <div className="w-full h-3 bg-gradient-to-r from-primary-600 to-gold-500 rounded-full mb-3 shadow-lg shadow-primary-500/30"></div>
          <p className="text-sm text-gray-400 font-medium tracking-wider">SCREEN</p>
        </div>
        
        {/* Seat Grid */}
        <div className="space-y-3 max-w-4xl mx-auto">
          {seatLayout.map((rowData, rowIndex) => (
            <motion.div 
              key={rowIndex} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              className="flex justify-center items-center space-x-2"
            >
              {/* Row Label */}
              <span className="w-8 text-sm text-gray-400 font-bold text-center">
                {rowData.row}
              </span>
              
              {/* Seats */}
              <div className="flex space-x-1">
                {rowData.seats.map((seat) => {
                  const isBooked = seat.isBooked;
                  const isSelected = seat.isSelected;
                  const isSelectable = !isBooked && (isSelected || selectedSeats.length < seatCount);
                  
                  return (
                    <motion.button
                      key={seat.number}
                      onClick={() => handleSeatClick(seat.number, isBooked, isSelected)}
                      disabled={isBooked || (!isSelected && selectedSeats.length >= seatCount)}
                      className={`
                        w-8 h-8 text-xs font-bold flex items-center justify-center rounded transition-all duration-200
                        ${isBooked 
                          ? 'seat-booked cursor-not-allowed' 
                          : isSelected 
                          ? 'seat-selected transform scale-110 shadow-lg shadow-gold-500/50' 
                          : isSelectable
                          ? 'seat-available hover:scale-105 hover:shadow-md'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }
                      `}
                      whileHover={!isBooked && isSelectable ? { scale: 1.1 } : {}}
                      whileTap={!isBooked && isSelectable ? { scale: 0.95 } : {}}
                      title={`${seat.row}${seat.seatInRow} ${isBooked ? '(Booked)' : isSelected ? '(Selected)' : '(Available)'}`}
                    >
                      {seat.seatInRow}
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Seat Numbers for Reference */}
              <span className="w-8 text-xs text-gray-500 text-center">
                {rowData.seats[0]?.seatNumber}-{rowData.seats[rowData.seats.length - 1]?.seatNumber}
              </span>
            </motion.div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-8 mt-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-600 rounded"></div>
            <span className="text-gray-400">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gold-500 rounded"></div>
            <span className="text-gray-400">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-600 rounded"></div>
            <span className="text-gray-400">Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-700 rounded"></div>
            <span className="text-gray-400">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-primary-600/10 border border-primary-600/50 rounded-lg p-6"
          >
            <h4 className="text-lg font-semibold text-white mb-4">Booking Summary</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400">Selected Seats</p>
                <p className="text-white font-medium">{formatSeatNumbers(selectedSeats)}</p>
              </div>
              <div>
                <p className="text-gray-400">Screen</p>
                <p className="text-white font-medium">{show.screen_name}</p>
              </div>
              <div>
                <p className="text-gray-400">Quantity</p>
                <p className="text-white font-medium">{selectedSeats.length} ticket{selectedSeats.length !== 1 ? 's' : ''}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Amount</p>
                <p className="text-white font-bold text-2xl">{formatAmount(totalPrice)}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={clearSelection}
                className="btn-secondary flex-1"
              >
                Clear Selection
              </button>
              <button
                onClick={() => onBooking(selectedSeats)}
                disabled={isBookingLoading || selectedSeats.length === 0}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                {isBookingLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm Booking</span>
                    <span className="font-bold">{formatAmount(totalPrice)}</span>
                  </>
                )}
              </button>
            </div>
            
            {selectedSeats.length !== seatCount && (
              <p className="text-yellow-400 text-sm mt-3 text-center">
                Please select {seatCount - selectedSeats.length} more seat{seatCount - selectedSeats.length !== 1 ? 's' : ''}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiSeatSelector;