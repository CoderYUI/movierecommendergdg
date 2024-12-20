// Importing necessary React hooks and components
import React, { useState, useEffect } from "react";

// Importing custom components for the application
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MovieList from "./components/MovieList";
import toast from 'react-hot-toast'; // For displaying notification toasts
import CartItems from "./components/CartItems";
import RecommendedItems from "./components/RecommendItems";
import { BrowserRouter, Routes, Route } from "react-router"; // For handling routing

export default function App() {
  // State management for cart items
  // Initialize cart from localStorage if exists, otherwise start with an empty array
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // State to store recommended movies
  const [recMovies, setRecMovies] = useState([]);

  // Effect to synchronize cart state with localStorage
  // Runs every time cart state changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Function to add a movie to the cart
  const addToCart = async (movie) => {
    // Check if movie is already in the cart
    const movieInCart = cart.find((item) => item.id === movie.id);

    if (movieInCart) {
      // Show error toast if movie is already in cart
      toast.error('Item is already in the cart.');
    } else {
      try {
        // Add movie to cart
        setCart([...cart, movie]);
        // Show success toast
        toast.success('Item added to the cart.');

        const response = await fetch('http://127.0.0.1:5000/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: movie.name,
            top_n: 5,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations.');
        }
        const recommendMovies = await response.json();
        setRecMovies(recommendMovies); // Add this line to update the state
        console.log("Recommendations:", recommendMovies);  
      } catch (error) {
        // Log and show error if recommendation fetch fails
        console.error('Error while fetching recommendations:', error);
        toast.error('Failed to fetch recommendations.');
      }
    }
  };
  
  // Function to remove a movie from the cart
  const removeFromCart = (movieId) => {
    // Find the movie in the cart
    const movieInCart = cart.find((movie) => movie.id == movieId);

  
    if (movieInCart) {
      // Remove the movie from cart
      setCart(cart.filter((movie) => movie.id !== movieId));
      // Show success toast
      toast.success('Item removed from the cart.');
    } else {
      // Show error toast if movie is not in cart
      toast.error('Item is not in the cart.');
    }
  };

  // Render the application layout and routes
  return (
    <BrowserRouter>
      <div className="bg-black text-white">
        {/* Navbar with cart item count */}
        <Navbar cartCount={cart.length} />
        
        {/* Define application routes */}
        <Routes>
          {/* Home route */}
          <Route
            path="/"
            element={
              <>
                {/* Hero section */}
                <Hero />
                
                {/* Show recommended items if available */}
                {recMovies.length > 0 && (
                  <RecommendedItems movies={recMovies}/>
                )}
                
                {/* Movie list with add to cart functionality */}
                <MovieList addToCart={addToCart}/>
              </>
            }
          />
          
          {/* Cart route */}
          <Route
            path="/cart"
            element={
              <CartItems cart={cart} removeFromCart={removeFromCart}/>
            }
          />
        </Routes>
        
      </div>
    </BrowserRouter>
  );
}