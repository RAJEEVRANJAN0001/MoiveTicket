import { GoogleGenerativeAI } from '@google/generative-ai';

class MovieDataService {
  constructor() {
    this.geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;
    this.omdbApiKey = process.env.REACT_APP_OMDB_API_KEY || 'b48416e9';
    this.cache = new Map();
    this.genAI = this.geminiApiKey ? new GoogleGenerativeAI(this.geminiApiKey) : null;
    
    console.log('MovieDataService initialized with:');
    console.log('- Gemini API:', this.geminiApiKey ? 'Configured' : 'Not configured');
    console.log('- OMDB API:', this.omdbApiKey ? 'Configured' : 'Not configured');
  }

  // Generate movie data using Gemini AI
  async generateMovieDataWithAI(movieTitle) {
    if (!this.genAI) {
      console.warn('Gemini API not configured');
      return null;
    }

    const cacheKey = `ai_${movieTitle}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        Generate detailed information about the movie "${movieTitle}" in JSON format:
        {
          "title": "${movieTitle}",
          "plot": "Detailed plot summary (2-3 sentences)",
          "cast": ["actor1", "actor2", "actor3", "actor4"],
          "director": "Director name",
          "genre": ["genre1", "genre2"],
          "year": 2023,
          "runtime": "120 minutes",
          "rating": 8.5,
          "language": "English",
          "country": "USA",
          "awards": "Any notable awards or nominations"
        }
        
        Only return valid JSON, no additional text.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const movieData = JSON.parse(text.replace(/```json|```/g, '').trim());
      
      this.cache.set(cacheKey, movieData);
      return movieData;
    } catch (error) {
      console.error('Error generating movie data with AI:', error);
      return null;
    }
  }

  // Fetch movie data from OMDB API
  async fetchFromOMDB(movieTitle) {
    const cacheKey = `omdb_${movieTitle}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const url = `https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${this.omdbApiKey}&plot=full`;
      console.log('OMDB API Request:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OMDB API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('OMDB API Response for', movieTitle, ':', data);
      
      if (data.Response === 'True') {
        const movieData = {
          title: data.Title,
          year: parseInt(data.Year),
          genre: data.Genre ? data.Genre.split(', ') : [],
          director: data.Director,
          cast: data.Actors ? data.Actors.split(', ') : [],
          plot: data.Plot,
          poster: data.Poster !== 'N/A' ? data.Poster : null,
          imdbRating: parseFloat(data.imdbRating) || null,
          runtime: data.Runtime,
          language: data.Language,
          country: data.Country,
          awards: data.Awards !== 'N/A' ? data.Awards : null,
          imdbID: data.imdbID
        };
        
        this.cache.set(cacheKey, movieData);
        console.log('Processed OMDB data:', movieData);
        return movieData;
      } else {
        console.log('OMDB API Error:', data.Error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching from OMDB:', error);
      return null;
    }
  }

  // Search for movies using OMDB
  async searchMovies(query, page = 1) {
    try {
      const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&page=${page}&apikey=${this.omdbApiKey}`;
      console.log('OMDB Search Request:', url);
      
      const response = await fetch(url);
      
      const data = await response.json();
      console.log('OMDB Search Response:', data);
      
      if (data.Response === 'True') {
        return {
          movies: data.Search.map(movie => ({
            title: movie.Title,
            year: parseInt(movie.Year),
            imdbID: movie.imdbID,
            poster: movie.Poster !== 'N/A' ? movie.Poster : null,
            type: movie.Type
          })),
          totalResults: parseInt(data.totalResults),
          currentPage: page
        };
      }
      
      console.log('OMDB Search Error:', data.Error);
      return { movies: [], totalResults: 0, currentPage: page };
    } catch (error) {
      console.error('Error searching movies:', error);
      return { movies: [], totalResults: 0, currentPage: page };
    }
  }

  // Get enhanced movie data by combining multiple sources
  async getEnhancedMovieData(movieTitle) {
    const cacheKey = `enhanced_${movieTitle}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Try OMDB first (reliable and has posters)
      let movieData = await this.fetchFromOMDB(movieTitle);
      
      // If OMDB doesn't have complete data, enhance with AI
      if (!movieData || !movieData.plot || movieData.plot.length < 50) {
        const aiData = await this.generateMovieDataWithAI(movieTitle);
        if (aiData) {
          movieData = movieData ? { ...movieData, ...aiData } : aiData;
        }
      }

      // If we still don't have a poster, try to generate one URL
      if (movieData && !movieData.poster) {
        movieData.poster = this.generatePosterUrl(movieTitle);
      }

      if (movieData) {
        this.cache.set(cacheKey, movieData);
      }

      return movieData;
    } catch (error) {
      console.error('Error getting enhanced movie data:', error);
      return null;
    }
  }

  // Generate poster URL from movie title (fallback)
  generatePosterUrl(movieTitle) {
    // Use a service like TheMovieDB or create a placeholder
    const cleanTitle = movieTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '+');
    return `https://via.placeholder.com/300x450/1a1a1a/ffffff?text=${encodeURIComponent(movieTitle)}`;
  }

  // Enhance existing movie list with external data
  async enhanceMovieList(movies) {
    if (!Array.isArray(movies)) {
      return [];
    }

    const enhancedMovies = await Promise.all(
      movies.map(async (movie) => {
        try {
          const enhancedData = await this.getEnhancedMovieData(movie.title);
          
          return {
            ...movie,
            enhancedData: enhancedData || {},
            poster: enhancedData?.poster || this.generatePosterUrl(movie.title),
            imdbRating: enhancedData?.imdbRating || movie.rating,
            plot: enhancedData?.plot || movie.description,
            cast: enhancedData?.cast || [],
            director: enhancedData?.director || 'Unknown',
            awards: enhancedData?.awards || null,
            genres: enhancedData?.genre || (movie.genre ? [movie.genre] : [])
          };
        } catch (error) {
          console.error(`Error enhancing movie ${movie.title}:`, error);
          return {
            ...movie,
            poster: this.generatePosterUrl(movie.title),
            enhancedData: {}
          };
        }
      })
    );

    return enhancedMovies;
  }

  // Generate movie recommendations using AI
  async generateMovieRecommendations(count = 10) {
    if (!this.genAI) {
      // Fallback to popular movies if AI not available
      return this.getPopularMovies(count);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        Generate a list of ${count} popular and critically acclaimed movies from the last 10 years.
        Return only a JSON array of movie titles:
        ["Movie Title 1", "Movie Title 2", "Movie Title 3", ...]
        
        Include a mix of different genres and ensure all are well-known movies.
        Only return valid JSON, no additional text.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const movieTitles = JSON.parse(text.replace(/```json|```/g, '').trim());
      
      // Get enhanced data for each movie
      const recommendations = await Promise.all(
        movieTitles.slice(0, count).map(async (title) => {
          const data = await this.getEnhancedMovieData(title);
          return data || { title, poster: this.generatePosterUrl(title) };
        })
      );

      return recommendations.filter(movie => movie !== null);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getPopularMovies(count);
    }
  }

  // Fallback popular movies list
  getPopularMovies(count = 10) {
    const popularMovies = [
      'Avatar: The Way of Water', 'Top Gun: Maverick', 'Black Panther: Wakanda Forever',
      'Jurassic World Dominion', 'Thor: Love and Thunder', 'Minions: The Rise of Gru',
      'Doctor Strange in the Multiverse of Madness', 'The Batman', 'Sonic the Hedgehog 2',
      'Fantastic Beasts: The Secrets of Dumbledore', 'Morbius', 'The Northman',
      'Everything Everywhere All at Once', 'Spider-Man: No Way Home', 'Dune'
    ];

    return popularMovies.slice(0, count).map(title => ({
      title,
      poster: this.generatePosterUrl(title),
      year: 2022,
      genre: ['Action', 'Adventure']
    }));
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

const movieDataServiceInstance = new MovieDataService();
export default movieDataServiceInstance;