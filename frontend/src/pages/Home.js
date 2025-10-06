import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, ArrowRight, Ticket, Clock, Users } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Film,
      title: 'Latest Movies',
      description: 'Watch the newest blockbusters and indie films in premium theaters',
    },
    {
      icon: Ticket,
      title: 'Easy Booking',
      description: 'Simple and secure seat selection with instant confirmation',
    },
    {
      icon: Clock,
      title: 'Flexible Showtimes',
      description: 'Multiple showtimes throughout the day to fit your schedule',
    },
    {
      icon: Users,
      title: 'Group Bookings',
      description: 'Book multiple seats together for family and friends',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="hero-background"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1489599150074-e47340ce3769?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-20 text-center"
        >
          <div className="max-w-4xl mx-auto px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
            >
              Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-gold-500">
                {' '}Cinema{' '}
              </span>
              Experience
            </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
          >
            Discover and book tickets for the latest movies in premium theaters. 
            Enjoy the perfect cinema experience with easy booking and great seats.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/movies"
              className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group"
            >
              <Film className="w-5 h-5" />
              <span>Browse Movies</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="py-20 bg-dark-900/50"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Experience the best movie booking platform with premium features and 
              excellent service to make your cinema experience unforgettable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="py-20"
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Ready to Book Your Movie?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of movie lovers who trust our platform. 
            Book your tickets now and enjoy the ultimate cinema experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/movies"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2 group"
            >
              <Film className="w-5 h-5" />
              <span>Browse Movies</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.section>
      </div>
    </div>
  );
};

export default Home;