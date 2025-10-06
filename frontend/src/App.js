import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Movies from './pages/Movies';
import ShowDetails from './pages/ShowDetails';
import MyBookings from './pages/MyBookings';
import APITestPage from './pages/APITestPage';
import SeatBooking from './pages/SeatBooking';
import PaymentConfirmation from './pages/PaymentConfirmation';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen cinema-gradient">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:movieId/shows" element={<ShowDetails />} />
            <Route path="/api-test" element={<APITestPage />} />
            <Route path="/booking/seats/:movieId" element={<SeatBooking />} />
            <Route path="/booking/payment" element={<PaymentConfirmation />} />
            <Route 
              path="/my-bookings" 
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f1f1f',
              color: '#fff',
              border: '1px solid #404040',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;