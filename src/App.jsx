import React, { useState, useEffect } from 'react';
import './App.css';
import Search from './components/Search';
import Spinner from './components/Spinner';
import MCard from './components/MCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';


const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS ={
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useDebounce(()=> setDebouncedSearchTerm(searchTerm), 500,  [searchTerm]);

  const fetchMovies = async (query='') => {
    setIsLoading(true);
    setErrorMessage('');

   try{
      const endPoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endPoint, API_OPTIONS)

      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      
      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if(query && data.results.length > 0) {
        await updateSearchCount(query);
      }
    
    } catch (error) {
      console.error(`Error Fetching Movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later')
    } finally {
      setIsLoading(false);
    }
  }
  
const loadTrendingMovies = async () => {
  try {
    const movies = await getTrendingMovies();
    console.log('Trending movies:', movies); // Debug log
    setTrendingMovies(movies);
  } catch (error) {
    console.error(`Error Fetching Trending Movies: ${error}`);
  }
}

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>
          <img src='/hero.png' alt='hero' className='hero'/>
          <h1 className='title'>
            Find <span className='text-gradient'>Movies</span> You'll Enjoy<br/> Without the Hassel 
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        {trendingMovies.length > 0 && !isLoading && !errorMessage && (
          <section className='trending'>
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id || movie.id || index}>
                  <p>{index + 1}</p>
                  {/* Only show image if poster.url exists */}
                  {movie.poster && movie.poster.url ? (
                    <img src={movie.poster.url} alt={movie.title || 'Trending Movie'} />
                  ) : null}
                  <p>{movie.title || movie.name || 'Untitled'}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h1>All Movies</h1>
          {isLoading ? (
             <Spinner/>
          ) : errorMessage ? (
             <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul className="movie-grid">
              {movieList.map((movie) => (
                <MCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>

      </div>
        
  </main>
  )
}

export default App