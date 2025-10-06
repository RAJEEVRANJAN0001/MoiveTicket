import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Database } from 'lucide-react';

const DemoNotice = () => {
  // Check if we're in demo mode
  const isDemo = process.env.REACT_APP_DEMO_MODE === 'true';

  if (!isDemo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mb-6"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Database className="w-5 h-5 text-blue-400 mt-0.5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-100 mb-1">
            Demo Mode Active
          </h3>
          <p className="text-xs text-blue-200/80 mb-3">
            This is a demonstration version using real movie data from OMDB API with mock booking functionality.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-100">User Registration & Login</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-100">Movie Browsing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-100">Seat Selection & Booking</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-100">Booking Management</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DemoNotice;