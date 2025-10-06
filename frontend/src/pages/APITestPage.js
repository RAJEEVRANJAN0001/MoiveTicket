import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Star, Clock } from 'lucide-react';
import movieDataService from '../services/movieDataService';

const APITestPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [testResult, setTestResult] = useState(null);

  const testOMDBWithID = async () => {
    setLoading(true);
    try {
      // Test with the specific movie ID from your example
      const response = await fetch(`https://www.omdbapi.com/?i=tt3896198&apikey=b48416e9`);
      const data = await response.json();
      console.log('OMDB ID Test Result:', data);
      setTestResult(data);
    } catch (error) {
      console.error('OMDB ID Test Error:', error);
      setTestResult({ Error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const searchResults = await movieDataService.searchMovies(searchTerm);
      console.log('Search Results:', searchResults);
      
      const enhancedResults = await Promise.all(
        searchResults.movies.slice(0, 6).map(async (movie) => {
          const enhanced = await movieDataService.getEnhancedMovieData(movie.title);
          return { ...movie, ...enhanced };
        })
      );
      
      setResults(enhancedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const recommendations = await movieDataService.generateMovieRecommendations(6);
      console.log('AI Recommendations:', recommendations);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Recommendations error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">API Integration Test</h1>
        
        {/* OMDB ID Test Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">OMDB API Test (Your API Key)</h2>
          <button 
            onClick={testOMDBWithID}
            disabled={loading}
            className="btn-primary flex items-center space-x-2 mb-4"
          >
            <Search className="w-4 h-4" />
            <span>Test OMDB API (ID: tt3896198)</span>
          </button>
          
          {testResult && (
            <div className="bg-dark-800 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-2">OMDB Test Result:</h3>
              {testResult.Error ? (
                <p className="text-red-400">Error: {testResult.Error}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testResult.Poster && (
                    <img 
                      src={testResult.Poster} 
                      alt={testResult.Title}
                      className="w-full h-64 object-cover rounded"
                    />
                  )}
                  <div className="text-sm text-gray-300 space-y-2">
                    <p><strong>Title:</strong> {testResult.Title}</p>
                    <p><strong>Year:</strong> {testResult.Year}</p>
                    <p><strong>Rating:</strong> {testResult.imdbRating}</p>
                    <p><strong>Genre:</strong> {testResult.Genre}</p>
                    <p><strong>Director:</strong> {testResult.Director}</p>
                    <p><strong>Actors:</strong> {testResult.Actors}</p>
                    <p><strong>Plot:</strong> {testResult.Plot}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Search Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Movie Search (OMDB API)</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for movies..."
              className="input-field flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
          
          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((movie, index) => (
                <motion.div
                  key={movie.imdbID || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-dark-800 rounded-lg p-4"
                >
                  {movie.poster && (
                    <img 
                      src={movie.poster} 
                      alt={movie.title}
                      className="w-full h-48 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="text-white font-semibold mb-2">{movie.title}</h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>IMDB: {movie.imdbRating || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{movie.runtime || 'N/A'}</span>
                    </div>
                    <p>Year: {movie.year}</p>
                    <p>Genre: {movie.genre?.join(', ') || 'N/A'}</p>
                  </div>
                  {movie.plot && (
                    <p className="text-gray-400 text-sm mt-2 line-clamp-3">{movie.plot}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">AI Movie Recommendations (Gemini AI)</h2>
          <button 
            onClick={generateRecommendations}
            disabled={loading}
            className="btn-primary flex items-center space-x-2 mb-4"
          >
            <Zap className="w-4 h-4" />
            <span>Generate AI Recommendations</span>
          </button>
          
          {aiRecommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiRecommendations.map((movie, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-purple-900/20 border border-purple-600/50 rounded-lg p-4"
                >
                  {movie.poster && (
                    <img 
                      src={movie.poster} 
                      alt={movie.title}
                      className="w-full h-48 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="text-white font-semibold mb-2">{movie.title}</h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Rating: {movie.rating || movie.imdbRating || 'N/A'}</span>
                    </div>
                    <p>Year: {movie.year}</p>
                    <p>Genre: {movie.genre?.join(', ') || 'N/A'}</p>
                    <p>Director: {movie.director || 'N/A'}</p>
                  </div>
                  {movie.plot && (
                    <p className="text-gray-400 text-sm mt-2 line-clamp-3">{movie.plot}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default APITestPage;