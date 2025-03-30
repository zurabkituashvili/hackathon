// AuthPage.js - Main container component that switches between Login and Signup
import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import './Login.css'; // We'll use the same CSS file

const AuthPage = () => {
  // State variables for the entire auth page
  const [isLogin, setIsLogin] = useState(true);
  const [theme, setTheme] = useState('light');

  // Initialize theme based on system preference or saved preference
  useEffect(() => {
    // Check system preference
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDarkMode ? 'dark' : 'light';
    
    // Try to get saved theme from localStorage
    let savedTheme;
    try {
      savedTheme = localStorage.getItem('theme');
    } catch (e) {
      console.log('localStorage not available');
    }
    
    // Apply theme
    const themeToApply = savedTheme || initialTheme;
    setTheme(themeToApply);
    document.documentElement.setAttribute('data-theme', themeToApply);
    
    // Save initial theme if not already saved
    if (!savedTheme) {
      try {
        localStorage.setItem('theme', themeToApply);
      } catch (e) {
        console.log('Failed to save theme preference');
      }
    }
  }, []);

  // Toggle theme handler
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.log('Failed to save theme preference');
    }
  };

  // Toggle between Login and Signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className='login-shite'>
      <div className="login-container">
      <button 
        className="theme-toggle" 
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} 
        onClick={toggleTheme}
      >
        {theme === 'light' ? '☀️' : '🌙'}
      </button>
      
      <div className="logo">
        <div className="logo-icon">🔐</div>
      </div>
      
      <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
      
      {isLogin ? (
        <LoginForm toggleAuthMode={toggleAuthMode} />
      ) : (
        <SignUpForm toggleAuthMode={toggleAuthMode} />
      )}
    </div>
    </div>
    
  );
};

export default AuthPage;

