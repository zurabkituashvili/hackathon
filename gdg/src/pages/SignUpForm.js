import React, { useState } from 'react';
import axios from 'axios';

const SignUpForm = ({ toggleAuthMode }) => {
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  const chatpostEndpoint = `http://127.0.0.1:8000/api/register/`;

  // Form validation
  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatePasswordMatch = (password, confirmPassword) => {
    return password === confirmPassword;
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    
    // Reset errors
    setEmailError(false);
    setPasswordError(false);
    setConfirmPasswordError(false);
    setNameError(false);
    setSignupError('');
    
    // Validate name
    if (!validateName(fullName)) {
      setNameError(true);
      isValid = false;
    }

    // Validate email
    if (!validateEmail(email)) {
      setEmailError(true);
      isValid = false;
    }
    
    // Validate password
    if (!validatePassword(password)) {
      setPasswordError(true);
      isValid = false;
    }

    // Validate password match
    if (!validatePasswordMatch(password, confirmPassword)) {
      setConfirmPasswordError(true);
      isValid = false;
    }
    
    // Proceed with form submission if valid
    if (isValid) {
      try {
        // Show loading state
        setIsLoading(true);
        
        console.log({fullName}, {email}, {password})
        // Make API call
        const response = await axios.post(`http://127.0.0.1:8000/api/register/`, {
          "username": fullName,
          "email": email,
          "password": password
        });
        
        console.log('Sign up response:', response.data);
        
        // Success - show success message
        alert('Account created successfully!');
        
        // Clear form
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to login
        toggleAuthMode();
        
      } catch (error) {
        // Handle registration errors
        console.error('Registration failed:', error);
        setSignupError(
          error.response?.data?.message || 
          'Registration failed. Please try again with different information.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {signupError && (
          <div className="error-message" style={{ marginBottom: '15px', color: 'red' }}>
            {signupError}
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
            Please enter your full name (at least 2 characters)
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="signupEmail">Email</label>
          <input 
            type="email" 
            id="signupEmail" 
            name="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(false);
            }}
            required
          />
          <div 
            className="error-message" 
            style={{ display: emailError ? 'block' : 'none' }}
          >
            Please enter a valid email address
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="signupPassword">Password</label>
          <div className="password-container">
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="signupPassword" 
              name="password" 
              placeholder="Create a password" 
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

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-container">
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="confirmPassword" 
              name="confirmPassword" 
              placeholder="Confirm your password" 
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError(false);
              }}
              required
            />
          </div>
          <div 
            className="error-message" 
            style={{ display: confirmPasswordError ? 'block' : 'none' }}
          >
            Passwords do not match
          </div>
        </div>
        
        <button 
          type="submit" 
          className={`login-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="sign-up">
        Already have an account? <a href="#" onClick={toggleAuthMode}>Log in</a>
      </div>
    </>
  );
};

export default SignUpForm;