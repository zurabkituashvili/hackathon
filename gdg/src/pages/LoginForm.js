import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const LoginForm = ({ toggleAuthMode }) => {
  // Add navigate hook
  const navigate = useNavigate();
  
  // State variables
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const chatloginEndpoint = 'http://127.0.0.1:8000/api/login/';

  // Form validation
  const validateName = (name) => {
    return name.trim().length > 0;
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    
    // Reset errors
    setNameError(false);
    setPasswordError(false);
    setLoginError('');
    
    // Validate full name
    if (!validateName(fullName)) {
      setNameError(true);
      isValid = false;
    }
    
    // Validate password
    if (!validatePassword(password)) {
      setPasswordError(true);
      isValid = false;
    }
    
    // Proceed with form submission if valid
    if (isValid) {
      try {
        // Show loading state
        setIsLoading(true);
        
        // Make API call
        const response = await axios.post(chatloginEndpoint, {
            "username": fullName,
            "password": password
          });
        
        console.log('Login response:', response.data);

        console.log('Login response:', response.data.access);
        
        // Handle successful login
        // Store any tokens or user data if needed
        if (response.data.access) {
          console.log('Login response:', response.data.token);
          localStorage.setItem('authToken', response.data.access);
        }
        
        // Clear form
        setFullName('');
        setPassword('');
        setRememberMe(false);
        
        // Navigate to dashboard or home page
        navigate('/'); // Change to your desired route
        
      } catch (error) {
        // Handle login errors
        console.error('Login failed:', error);
        setLoginError(
          error.response?.data?.message || 
          'Login failed. Please check your credentials.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle forgot password
  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Forgot password flow would start here.');
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {loginError && (
          <div className="error-message" style={{ marginBottom: '15px', color: 'red' }}>
            {loginError}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input 
            type="text" 
            id="fullName" 
            name="fullName" 
            placeholder="Enter your full name" 
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setNameError(false);
            }}
            required
          />
          <div 
            className="error-message" 
            style={{ display: nameError ? 'block' : 'none' }}
          >
            Please enter your full name
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-container">
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="password" 
              name="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              required
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🔒' : '👁️'}
            </button>
          </div>
          <div 
            className="error-message" 
            style={{ display: passwordError ? 'block' : 'none' }}
          >
            Password must be at least 6 characters
          </div>
        </div>
        
        <div className="remember-forgot">
          <div className="checkbox-container">
            <input 
              type="checkbox" 
              id="rememberMe" 
              name="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          <a href="#" className="forgot-password" onClick={handleForgotPassword}>
            Forgot password?
          </a>
        </div>
        
        <button 
          type="submit" 
          className={`login-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="sign-up">
        Don't have an account? <a href="#" onClick={toggleAuthMode}>Sign up</a>
      </div>
    </>
  );
};

export default LoginForm;