import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar, Users } from 'lucide-react';
import { formatDuration, formatDateTime } from '../utils/helpers';

const MovieHero = ({ movie, selectedShow }) => {
  const rapidApiData = movie?.rapidApiData || {};
  const posterUrl = rapidApiData.primaryImage;
  const genres = rapidApiData.genres || [];
  const actors = rapidApiData.actors || [];
  const imdbRating = rapidApiData.imdbRating;
  const plot = rapidApiData.plot;
  const releaseYear = rapidApiData.releaseYear;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      {/* Background */}
      <div className="absolute inset-0">
        {posterUrl ? (
          <>
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover blur-3xl scale-110 opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/90 to-dark-950/70" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-dark-950 via-primary-900/20 to-dark-950" />
        )}
      </div>

      {/* Content */}
      <div className="relative p-8 md:p-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Movie Poster */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-shrink-0"
          >
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-64 h-96 object-cover rounded-xl shadow-2xl"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/400x600/1f1f1f/ef4444?text=${encodeURIComponent(movie.title)}`;
                }}
              />
            ) : (
              <div className="w-64 h-96 bg-gradient-to-br from-primary-600/20 to-primary-800/20 rounded-xl flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-white">
                      {movie.title.charAt(0)}
                    </span>
                  </div>
                  <p className="text-gray-400">No Poster Available</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Movie Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 space-y-6"
          >
            {/* Title and Year */}
            <div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-2">
                {movie.title}
              </h1>
              {releaseYear && (
                <p className="text-xl text-gray-300">({releaseYear})</p>
              )}
            </div>

            {/* Rating and Duration */}
            <div className="flex flex-wrap items-center gap-6">
              {(movie.rating || imdbRating) && (
                <div className="flex items-center space-x-2">
                  <Star className="w-6 h-6 text-gold-500 fill-current" />
                  <span className="text-xl font-semibold text-white">
                    {imdbRating || movie.rating}/10
                  </span>
                  <span className="text-gray-400">IMDb</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="w-5 h-5" />
                <span className="text-lg">
                  {formatDuration(rapidApiData.runtimeMinutes || movie.duration_minutes)}
                </span>
              </div>
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre, idx) => (
                  <span 
                    key={idx}
                    className="bg-primary-600/30 text-primary-200 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Plot */}
            {plot && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Overview</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {plot}
                </p>
              </div>
            )}

            {/* Cast */}
            {actors.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Cast</h3>
                <div className="flex flex-wrap gap-3">
                  {actors.slice(0, 6).map((actor) => (
                    <div key={actor.id} className="flex items-center space-x-3 bg-dark-800/50 rounded-lg p-3">
                      {actor.image ? (
                        <img
                          src={actor.image}
                          alt={actor.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {actor.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-white font-medium">{actor.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Show Info */}
            {selectedShow && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-primary-600/20 border border-primary-600/50 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold text-white mb-2">Selected Show</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateTime(selectedShow.date_time)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Users className="w-4 h-4" />
                    <span>{selectedShow.screen_name}</span>
                  </div>
                  <div className="text-primary-400 font-bold text-lg">
                    ${selectedShow.price}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MovieHero;