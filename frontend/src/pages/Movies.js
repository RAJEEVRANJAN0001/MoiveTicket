import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Zap, Star, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import movieDataService from '../services/movieDataService';
import TheaterMovieCard from '../components/TheaterMovieCard';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [genreFilter, setGenreFilter] = useState('');
  const [allGenres, setAllGenres] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState('');

  useEffect(() => {
    const initializeMovies = async () => {
      try {
        const response = await apiService.getMovies();
        const backendMovies = response.data.results || response.data;
        setMovies(backendMovies);
        
        // Initialize theaters data
        initializeTheaters();
        
        // Enhance with external APIs
        enhanceMoviesWithExternalData(backendMovies);
      } catch (error) {
        toast.error('Failed to fetch movies');
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeMovies();
  }, []);

  useEffect(() => {
    // Filter movies based on search term and genre
    let filtered = movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (movie.genre && movie.genre.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (movie.plot && movie.plot.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (movie.cast && movie.cast.some(actor => actor.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesGenre = !genreFilter || 
                          (movie.genre && movie.genre.toLowerCase() === genreFilter.toLowerCase()) ||
                          (movie.genres && movie.genres.some(g => g.toLowerCase() === genreFilter.toLowerCase()));
      
      return matchesSearch && matchesGenre;
    });

    // If searching externally, combine with search results
    if (searchTerm && searchResults.length > 0) {
      const externalMovies = searchResults.filter(movie => 
        !filtered.some(existing => existing.title.toLowerCase() === movie.title.toLowerCase())
      );
      filtered = [...filtered, ...externalMovies];
    }

    setFilteredMovies(filtered);
  }, [movies, searchTerm, genreFilter, searchResults]);

  useEffect(() => {
    // Extract all unique genres
    const genres = new Set();
    movies.forEach(movie => {
      if (movie.genre) genres.add(movie.genre);
      if (movie.genres) {
        movie.genres.forEach(genre => genres.add(genre));
      }
    });
    setAllGenres(Array.from(genres));
  }, [movies]);

  const enhanceMoviesWithExternalData = async (backendMovies) => {
    setEnhancing(true);
    try {
      const enhancedMovies = await movieDataService.enhanceMovieList(backendMovies);
      setMovies(enhancedMovies);
      toast.success('Movies enhanced with external data!');
    } catch (error) {
      console.error('Error enhancing movies:', error);
      toast.error('Failed to enhance movie data');
    } finally {
      setEnhancing(false);
    }
  };

  const searchExternalMovies = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await movieDataService.searchMovies(query);
      const enhancedResults = await Promise.all(
        results.movies.map(async (movie) => {
          const enhancedData = await movieDataService.getEnhancedMovieData(movie.title);
          return {
            ...movie,
            ...enhancedData,
            id: `external_${movie.imdbID || movie.title}`,
            isExternal: true
          };
        })
      );
      setSearchResults(enhancedResults);
    } catch (error) {
      console.error('Error searching external movies:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce external search
    const timeoutId = setTimeout(() => {
      searchExternalMovies(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const refreshMovieData = () => {
    setEnhancing(true);
    enhanceMoviesWithExternalData(movies);
  };

  const initializeTheaters = () => {
    const theaterData = [
      {
        id: 1,
        name: "Cineplex Downtown",
        location: "123 Main Street, Downtown",
        amenities: ["IMAX", "Dolby Atmos", "Recliner Seats"],
        distance: "0.5 miles",
        rating: 4.8,
        totalSeats: 180
      },
      {
        id: 2,
        name: "Starlight Cinema",
        location: "456 Oak Avenue, Central Plaza",
        amenities: ["4DX", "Premium Lounge", "Gourmet Concessions"],
        distance: "1.2 miles",
        rating: 4.6,
        totalSeats: 220
      },
      {
        id: 3,
        name: "Galaxy Multiplex",
        location: "789 Pine Street, Mall Complex",
        amenities: ["IMAX", "Luxury Recliners", "Full Bar"],
        distance: "2.1 miles",
        rating: 4.7,
        totalSeats: 300
      },
      {
        id: 4,
        name: "Metro Cinema Palace",
        location: "321 Broadway, Arts District",
        amenities: ["Vintage Décor", "Craft Beer", "Independent Films"],
        distance: "1.8 miles",
        rating: 4.5,
        totalSeats: 150
      },
      {
        id: 5,
        name: "Sunset Drive-In",
        location: "654 Highway 101, Outskirts",
        amenities: ["Classic Drive-In", "Food Trucks", "Double Features"],
        distance: "5.2 miles",
        rating: 4.4,
        totalSeats: 200
      },
      {
        id: 6,
        name: "Royal Theater",
        location: "987 King Street, Historic District",
        amenities: ["Historic Building", "Red Carpet Entry", "VIP Boxes"],
        distance: "3.0 miles",
        rating: 4.9,
        totalSeats: 250
      }
    ];
    
    setTheaters(theaterData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading movies...</p>
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
          Now Showing
          {(enhancing || isSearching) && (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="inline-block ml-4"
            >
              <Zap className="w-8 h-8 text-primary-500" />
            </motion.span>
          )}
        </h1>
        <p className="text-gray-400 text-lg mb-6">
          Discover and book tickets for the latest movies in premium theaters
        </p>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search movies by title, cast, plot, or discover new movies..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="input-field pl-12"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="input-field min-w-[150px]"
          >
            <option value="">All Genres</option>
            {allGenres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          
          <button 
            onClick={refreshMovieData}
            disabled={enhancing}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${enhancing ? 'animate-spin' : ''}`} />
            <span>Enhance Data</span>
          </button>
        </div>

        {/* Status Messages */}
        {enhancing && (
          <div className="bg-primary-600/20 border border-primary-600/50 rounded-lg p-4 mb-6">
            <p className="text-primary-300 text-sm flex items-center space-x-2">
              <Zap className="w-4 h-4 animate-pulse" />
              <span>Enhancing movies with AI and external movie databases...</span>
            </p>
          </div>
        )}

        {searchTerm && searchResults.length > 0 && (
          <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4 mb-6">
            <p className="text-green-300 text-sm">
              Found {searchResults.length} additional movies from external sources
            </p>
          </div>
        )}

        {/* Theater Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-dark-900/50 rounded-xl p-6 mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-primary-400" />
            <span>Select Your Cinema</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {theaters.map((theater) => (
              <motion.div
                key={theater.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTheater(theater.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedTheater === theater.id
                    ? 'bg-primary-600/30 border-2 border-primary-400'
                    : 'bg-dark-800/50 border border-gray-700 hover:border-primary-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{theater.name}</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-yellow-400 text-sm">{theater.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-2">{theater.location}</p>
                <p className="text-gray-500 text-xs mb-3">{theater.distance}</p>
                
                <div className="flex flex-wrap gap-1">
                  {theater.amenities.slice(0, 2).map((amenity, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-600/20 text-primary-300 text-xs rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                  {theater.amenities.length > 2 && (
                    <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded">
                      +{theater.amenities.length - 2} more
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          {selectedTheater && (
            <div className="mt-4 p-4 bg-primary-600/10 rounded-lg">
              <p className="text-primary-300 text-sm">
                Selected: {theaters.find(t => t.id === selectedTheater)?.name}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            {searchTerm ? 'No movies found' : 'No movies available'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms or check back later.' 
              : 'Check back later for new releases.'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="btn-primary"
            >
              Clear Search
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie, index) => (
            <TheaterMovieCard 
              key={movie.id} 
              movie={movie} 
              theaters={theaters}
              selectedTheater={selectedTheater}
              index={index} 
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {filteredMovies.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-12 pt-8 border-t border-dark-700"
        >
          <p className="text-gray-400">
            Showing {filteredMovies.length} of {movies.length} movies
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Movies;