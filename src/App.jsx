import React, { useEffect, useState } from "react";
import Search from "./components/Search.jsx";
import Spinner from "./components/spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from 'react-use'
import {updateSearchCount,getTrendingMovies} from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_API_KEY;

const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
    },
};

const App = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [movieList, setMovieList] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500,[searchTerm]);

    const fetchMovies = async (query = "") => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            console.log("Fetching from:", endpoint); // Debugging log

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error("Failed to fetch movies");
            }

            const data = await response.json();

            if (!data.results) {
                setErrorMessage("No movies found.");
                setMovieList([]);
                return;
            }

            setMovieList(data.results);
            if(query && data.results.length > 0) {
                try {
                    await updateSearchCount(query, data.results[0]);
                } catch (err) {
                    // Ignore Appwrite errors (e.g., project archived)
                    console.warn("updateSearchCount failed:", err.message);
                }
            }
        } catch (error) {
            console.error(`Error fetching movies: ${error.message}`);
            setErrorMessage("Error fetching movies");
        } finally {
            setIsLoading(false);
        }
    };

    const loadTrendingMovies = async () => {
        try{
            const movies = await getTrendingMovies();
            setTrendingMovies(Array.isArray(movies) ? movies : []);
        }catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
            // Fallback mock data for development/demo
            setTrendingMovies([
                {
                    $id: "1",
                    poster_url: "https://via.placeholder.com/100x150?text=Movie+1",
                    title: "Mock Trending Movie 1"
                },
                {
                    $id: "2",
                    poster_url: "https://via.placeholder.com/100x150?text=Movie+2",
                    title: "Mock Trending Movie 2"
                }
            ]);
        }
    }

       useEffect(() => {
        fetchMovies(debouncedSearchTerm);

    }, [debouncedSearchTerm]);
    useEffect(() => {
       loadTrendingMovies()

    }, [debouncedSearchTerm]);

    return (
        <main>
            <div className="pattern" />
            <div className="wrapper">
                <header>
                    <img src="./hero.webp" loading="eager" alt="Hero" />
                    <h1>
                        Find <span className="text-violet-300">Movies</span> You'll Enjoy
                        Without the Hassle
                    </h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {Array.isArray(trendingMovies) && trendingMovies.length > 0 &&(
                    <section className="trending">
                        <h2>Trending Movies</h2>
                        <ul>
                            {trendingMovies.map((movie,index) => (
                                <li key={movie.$id}>
                                    <p>{index+1}</p>
                                    <img src={movie.poster_url} alt={movie.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2 >All Movies</h2>
                    {isLoading ? (
                        <Spinner/>
                    ) : errorMessage ? (
                        <p className="text-white-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
};

export default App;
