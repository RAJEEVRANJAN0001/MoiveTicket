import axios from 'axios';

const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.REACT_APP_RAPIDAPI_HOST || 'moviesdatabase.p.rapidapi.com';

class MovieDataService {
  constructor() {
    this.api = axios.create({
      baseURL: `https://${RAPIDAPI_HOST}`,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });

    // Cache for storing fetched movie data
    this.cache = new Map();
    this.cacheExpiry = 1000 * 60 * 30; // 30 minutes
  }

  // Get cached data or fetch new
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const data = await fetchFunction();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('RapidAPI Error:', error);
      // Return cached data if available, even if expired
      if (cached) return cached.data;
      return null;
    }
  }

  // Search movies by title (for matching with backend movies)
  async searchMoviesByTitle(title) {
    const cacheKey = `search_${title}`;
    return this.getCachedData(cacheKey, async () => {
      const response = await this.api.get('/titles/search/title/' + encodeURIComponent(title), {
        params: {
          exact: 'false',
          titleType: 'movie',
          limit: 5,
        },
      });
      return response.data?.results || [];
    });
  }

  // Get movie details by ID
  async getMovieDetails(movieId) {
    const cacheKey = `details_${movieId}`;
    return this.getCachedData(cacheKey, async () => {
      const response = await this.api.get(`/titles/${movieId}`);
      return response.data?.results || null;
    });
  }

  // Get movie main actors
  async getMovieActors(movieId) {
    const cacheKey = `actors_${movieId}`;
    return this.getCachedData(cacheKey, async () => {
      const response = await this.api.get(`/titles/${movieId}/main_actors`);
      return response.data?.results || [];
    });
  }

  // Get popular/trending movies
  async getTrendingMovies(limit = 20) {
    const cacheKey = `trending_${limit}`;
    return this.getCachedData(cacheKey, async () => {
      const response = await this.api.get('/titles', {
        params: {
          titleType: 'movie',
          sort: 'year.decr',
          limit,
          startYear: 2020,
          endYear: 2025,
        },
      });
      return response.data?.results || [];
    });
  }

  // Enhanced movie data by combining backend and RapidAPI data
  async enhanceMovieData(backendMovie) {
    try {
      // Search for the movie on RapidAPI
      const searchResults = await this.searchMoviesByTitle(backendMovie.title);
      
      if (searchResults && searchResults.length > 0) {
        const rapidApiMovie = searchResults[0];
        
        // Get additional details and actors
        const [movieDetails, actors] = await Promise.all([
          this.getMovieDetails(rapidApiMovie.id),
          this.getMovieActors(rapidApiMovie.id),
        ]);

        return {
          ...backendMovie,
          rapidApiData: {
            id: rapidApiMovie.id,
            primaryImage: rapidApiMovie.primaryImage?.url || movieDetails?.primaryImage?.url,
            plot: movieDetails?.plot?.plotText?.plainText,
            releaseYear: rapidApiMovie.releaseYear || movieDetails?.releaseYear,
            runtimeMinutes: movieDetails?.runtime?.seconds ? Math.floor(movieDetails.runtime.seconds / 60) : null,
            genres: rapidApiMovie.genres?.genres?.map(g => g.text) || movieDetails?.genres?.genres?.map(g => g.text) || [],
            actors: actors?.slice(0, 5)?.map(actor => ({
              id: actor.id,
              name: actor.name,
              image: actor.primaryImage?.url,
            })) || [],
            imdbRating: movieDetails?.ratingsSummary?.aggregateRating || null,
          },
        };
      }

      return backendMovie;
    } catch (error) {
      console.error('Error enhancing movie data:', error);
      return backendMovie;
    }
  }

  // Batch enhance multiple movies
  async enhanceMoviesData(backendMovies) {
    const enhancedMovies = await Promise.allSettled(
      backendMovies.map(movie => this.enhanceMovieData(movie))
    );

    return enhancedMovies.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to enhance movie ${backendMovies[index].title}:`, result.reason);
        return backendMovies[index];
      }
    });
  }

  // Get placeholder image for movies without posters
  getPlaceholderImage(title) {
    return `https://via.placeholder.com/400x600/1f1f1f/ef4444?text=${encodeURIComponent(title)}`;
  }

  // Format runtime from RapidAPI to match backend format
  formatRuntime(runtimeMinutes, backendDuration) {
    if (runtimeMinutes) return runtimeMinutes;
    return backendDuration || 120; // Default fallback
  }
}

const movieDataService = new MovieDataService();
export default movieDataService;