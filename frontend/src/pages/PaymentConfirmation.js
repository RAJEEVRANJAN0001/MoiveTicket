import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Check, 
  Download, 
  Mail,
  MapPin,
  Clock,
  Users,
  Ticket,
  ArrowLeft,
  QrCode,
  Send,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatAmount } from '../utils/helpers';

const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const storedBooking = localStorage.getItem('currentBooking');
    if (storedBooking) {
      const booking = JSON.parse(storedBooking);
      // Add booking ID if it doesn't exist
      if (!booking.bookingId) {
        booking.bookingId = 'BK' + Date.now().toString().slice(-6);
      }
      setBookingData(booking);
    } else {
      // Also check for finalBooking as fallback
      const finalBooking = localStorage.getItem('finalBooking');
      if (finalBooking) {
        setBookingData(JSON.parse(finalBooking));
      } else {
        navigate('/movies');
      }
    }
  }, [navigate]);

  const processPayment = async () => {
    setPaymentProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Save booking to localStorage for My Bookings page
    const savedBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const newBooking = {
      ...bookingData,
      id: bookingData.bookingId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      booking_time: new Date().toISOString(),
      seat_number: bookingData.selectedSeats.map(seat => seat.id).join(', '),
      screen: bookingData.theater.name
    };
    
    savedBookings.push(newBooking);
    localStorage.setItem('userBookings', JSON.stringify(savedBookings));
    
    setPaymentProcessing(false);
    setPaymentComplete(true);
    
    toast.success('Payment successful! Booking confirmed and saved to My Bookings.');
    
    // Clear current booking data but keep saved bookings
    localStorage.removeItem('currentBooking');
    localStorage.removeItem('finalBooking');
  };

  const downloadTicket = () => {
    // Create a comprehensive ticket object
    const ticketData = {
      bookingId: bookingData.bookingId,
      movieTitle: bookingData.movieTitle,
      theater: bookingData.theater.name,
      location: bookingData.theater.location,
      showTime: bookingData.showTime,
      seats: bookingData.selectedSeats.map(seat => seat.id).join(', '),
      totalAmount: bookingData.totalAmount,
      bookingDate: new Date().toLocaleDateString(),
      qrCode: `QR-${bookingData.bookingId}`
    };

    // Create downloadable content
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

    // Create and download file
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${bookingData.bookingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Ticket downloaded successfully!');
  };

  const emailTicket = () => {
    setShowEmailModal(true);
  };

  const sendTicketByEmail = async () => {
    if (!emailAddress.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!emailAddress.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    
    try {
      // Simulate email sending (in real app, this would call your backend API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save booking to localStorage for My Bookings page
      const savedBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const newBooking = {
        ...bookingData,
        id: bookingData.bookingId,
        email: emailAddress,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      
      savedBookings.push(newBooking);
      localStorage.setItem('userBookings', JSON.stringify(savedBookings));
      
      toast.success(`Ticket sent to ${emailAddress} successfully!`);
      setShowEmailModal(false);
      setEmailAddress('');
    } catch (error) {
      toast.error('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Success Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-4">Booking Confirmed!</h1>
            <p className="text-gray-400 mb-8">
              Your tickets have been booked successfully. Check your email for confirmation.
            </p>

            {/* Ticket Summary */}
            <div className="bg-dark-900/50 rounded-xl p-6 mb-8 text-left">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Digital Ticket</h2>
                <QrCode className="w-8 h-8 text-primary-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-2">{bookingData.movieTitle}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{bookingData.theater.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{bookingData.showTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{bookingData.selectedSeats.length} seats</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Seat Details</h4>
                  <div className="flex flex-wrap gap-2">
                    {bookingData.selectedSeats.map((seat) => (
                      <span
                        key={seat.id}
                        className="px-2 py-1 bg-primary-600/20 text-primary-300 text-xs rounded"
                      >
                        {seat.id}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Amount</span>
                      <span className="text-xl font-bold text-green-400">{formatAmount(bookingData.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  Booking ID: {bookingData.bookingId}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={downloadTicket}
                className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Download Ticket</span>
              </button>

              <button
                onClick={emailTicket}
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>Email Ticket</span>
              </button>

              <button
                onClick={() => navigate('/movies')}
                className="flex items-center justify-center space-x-2 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Ticket className="w-5 h-5" />
                <span>Book More</span>
              </button>
            </div>

            {/* Email Modal */}
            {showEmailModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowEmailModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-dark-900 rounded-xl p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Send Ticket via Email</h3>
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-dark-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary-400 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendTicketByEmail}
                      disabled={sendingEmail}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      {sendingEmail ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Ticket</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <h1 className="text-3xl font-bold text-white">Complete Payment</h1>
          <div></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-900/50 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Payment Details</h2>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['card', 'paypal', 'apple'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-3 rounded-lg border transition-all ${
                      paymentMethod === method
                        ? 'border-primary-400 bg-primary-600/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto text-gray-400" />
                    <span className="text-xs text-gray-400 block mt-1 capitalize">{method}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Details Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full bg-dark-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full bg-dark-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full bg-dark-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-dark-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={processPayment}
              disabled={paymentProcessing}
              className="w-full mt-8 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {paymentProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay {formatAmount(bookingData.totalAmount)}</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-900/50 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Booking Summary</h2>

            <div className="space-y-4">
              <div className="border-b border-gray-700 pb-4">
                <h3 className="font-semibold text-white text-lg">{bookingData.movieTitle}</h3>
                <p className="text-gray-400">{bookingData.showTime}</p>
              </div>

              <div className="border-b border-gray-700 pb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span className="text-white font-semibold">{bookingData.theater.name}</span>
                </div>
                <p className="text-gray-400 text-sm">{bookingData.theater.location}</p>
              </div>

              <div className="border-b border-gray-700 pb-4">
                <h4 className="font-semibold text-white mb-2">Selected Seats</h4>
                <div className="grid grid-cols-4 gap-2">
                  {bookingData.selectedSeats.map((seat) => (
                    <div
                      key={seat.id}
                      className="bg-primary-600/20 border border-primary-500 rounded p-2 text-center"
                    >
                      <span className="text-primary-300 text-sm font-semibold">{seat.id}</span>
                      <div className="text-xs text-gray-400">{formatAmount(seat.price)}</div>
                    </div>
                  ))}
                </div>
              </div>

                              <div className="space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Tickets ({bookingData.selectedSeats.length}x)</span>
                  <span>{formatAmount(bookingData.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Booking Fee</span>
                  <span>₹50</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Taxes</span>
                  <span>{formatAmount(bookingData.totalAmount * 0.18)}</span>
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>{formatAmount(bookingData.totalAmount + 50 + (bookingData.totalAmount * 0.18))}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;