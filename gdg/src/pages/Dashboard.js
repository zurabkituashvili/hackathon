import React, { useState, useEffect, useRef } from 'react';
import { User, Package, HelpCircle, Home, LogIn, Moon, ChevronRight, PlusCircle, ChevronLeft, ChevronDown, Book, Paperclip, X } from 'lucide-react';
import './Dashboard.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const textRotateRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // API endpoints - update these with your actual endpoints later
  const courseEnd = 'http://127.0.0.1:8000/chatbot/api/get-courses/';
  const apiBaseUrl = 'http://127.0.0.1:8000/chatbot';

  // Get JWT token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  // Create axios instance with authorization headers
  const createAuthenticatedAxios = () => {
    const token = getAuthToken();
    return axios.create({
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      }
    });
  };

  const fetchCourseData = async() => {
    try {
      setLoading(true);
      const authAxios = createAuthenticatedAxios();
      const response = await authAxios.get(courseEnd);

      console.log('response');
      console.log(response);
      
      // Assuming the API returns data in the format {data: [...courses]}
      if (response.data && Array.isArray(response.data.courses)) {
        setCourses(response.data.courses);
      } else {
        // If no courses are found, set empty array
        setCourses([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to fetch courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };
  
  const postChatQuestion = async(chapterId, msgContent) => {
    try {
      // Fix the URL format to properly encode the message content
      const endpoint = 'http://127.0.0.1:8000/chatbot/api/add-course/';
      
      // Create FormData object for file upload
      const formData = new FormData();

      formData.append('course_name', msgContent);
      
      // Add file if one is selected
      if (selectedFile) {
        console.log(selectedFile)
        formData.append('file', selectedFile);
      }

      // Get auth token
      const token = getAuthToken();

      // Use FormData with proper content type and authorization header
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (err) {
      console.error("Error sending message:", err);
      return null;
    }
  };

  const handleSendData = async(chapterId) => {
    if (!inputText.trim() && !selectedFile) return;
    
    // Prepare message text that indicates if a file was attached
    const messageText = selectedFile 
      ? `${inputText} [File attached: ${selectedFile.name}]` 
      : inputText;
    
    // Add user message to chat
    const newUserMessage = {
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasAttachment: !!selectedFile
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Clear input and file
    const userInput = inputText;
    setInputText('');
    
    try {
      // Show loading message
      const loadingMessage = {
        text: "Loading...",
        sender: 'claude',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLoading: true
      };
      
      setMessages(prev => [...prev, loadingMessage]);
      
      // Send to API
      const responseData = await postChatQuestion(chapterId, userInput);
      console.log(responseData);

      // Update courses state
      if (responseData && responseData.courses) {
        setCourses(responseData.courses);
      }
      
      // Remove loading message and add actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        // Format the response as a readable string instead of trying to render object directly
        let responseText = "Course created successfully!";
        
        if (responseData && responseData.courses) {
          responseText += " Your course has been added to the system.";
        } else {
          responseText = "Sorry, I couldn't process your request.";
        }
        
        return [...filtered, {
          text: responseText,
          sender: 'claude',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      });
      
      // Reset the selected file
      setSelectedFile(null);
      
      // Refresh course data if needed
      setRefresh(prev => !prev);
    } catch (err) {
      console.error("Error in chat interaction:", err);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, {
          text: "Sorry, there was an error processing your message.",
          sender: 'claude',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      });
      
      // Reset the selected file even on error
      setSelectedFile(null);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [refresh]);
  
  // Toggle course dropdown
  const toggleCourse = (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
    }
  };
  
  // Initialize text rotation effect
  useEffect(() => {
    // Create TxtRotate instance when component mounts
    if (textRotateRef.current) {
      const rotations = ["web designer.", "wannabe developer.", "Photoshop lover."];
      const period = 2000;
      
      let rotationInstance = new TxtRotate(textRotateRef.current, rotations, period);
      
      // Clean up function
      return () => {
        // Clear any pending timeouts when component unmounts
        if (rotationInstance.timeoutId) {
          clearTimeout(rotationInstance.timeoutId);
        }
      };
    }
  }, []);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);
  
  // TxtRotate constructor
  function TxtRotate(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = "";
    this.isDeleting = false;
    this.timeoutId = null;
    this.tick();
  }
  
  // TxtRotate functionality
  TxtRotate.prototype.tick = function() {
    let i = this.loopNum % this.toRotate.length;
    let fullTxt = this.toRotate[i];
  
    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }
  
    this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';
  
    let delta = 300 - Math.random() * 100;
  
    if (this.isDeleting) {
      delta /= 2;
    }
  
    if (!this.isDeleting && this.txt === fullTxt) {
      delta = this.period;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === "") {
      this.isDeleting = false;
      this.loopNum++;
      delta = 500;
    }
  
    let that = this;
    this.timeoutId = setTimeout(function() {
      that.tick();
    }, delta);
  };
  
  const handleTextInputChange = (e) => {
    setInputText(e.target.value);
  };
  
  const handleSubmit = async () => {
    if (!inputText.trim() && !selectedFile) return;
    
    // Call the existing handleSendData function with the selected chapter ID
    await handleSendData(selectedChapterId);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Trigger file input click
  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };
  
  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Sidebar */}
      <div className="sidebar">
        {/* Logo */}
        <div className="logo-container">
          <div className="logo">
            <div className="logo-text">
                Socratica
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="nav-menu">
          <Link to='/mywork' className="nav-item nav-page">
            <User size={20} />
            <span>My work</span>
          </Link>
          <Link to='/' className="nav-item nav-page" >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          
          {/* Course Dropdowns */}
          {loading ? (
            <div className="loading-courses">Loading courses...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : courses.length === 0 ? (
            <div className="no-courses">No courses available</div>
          ) : (
            courses.map((course, idx) => (
              <div key={course.id || idx} className="course-dropdown">
                <div 
                  className={`nav-item course-header ${expandedCourse === (course.id || idx) ? 'active' : ''}`}
                  onClick={() => toggleCourse(course.id || idx)}
                >
                  <Book size={20} />
                  <span>{course.name || 'Untitled Course'}</span>
                  <ChevronDown 
                    size={16} 
                    className={`dropdown-icon ${expandedCourse === (course.id || idx) ? 'expanded' : ''}`} 
                  />
                </div>
                
                {expandedCourse === (course.id || idx) && (
                  <div className="chapter-list">
                    {course.chapters && course.chapters.length > 0 ? (
                      course.chapters.map((chapter, index) => (
                        <div 
                          key={index} 
                          className="chapter-item"
                          onClick={() => {
                            // If chapter is an object with an id property, use that, otherwise use index
                            const chapterId = typeof chapter === 'object' && chapter.id ? 
                              chapter.id : index;
                            
                            setSelectedChapterId(chapterId);
                            // You might also want to clear or load previous messages for this chapter
                            setMessages([]);
                          }}
                        >
                          <span className="chapter-bullet">•</span>
                          <span className="chapter-title">
                            {typeof chapter === 'object' ? 
                              (chapter.chapterName || 'Unnamed Chapter') : 
                              (chapter || 'Unnamed Chapter')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="no-chapters">No chapters available</div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </nav>
        
        {/* User Status (Already Signed In) */}
        <div className="sidebar-footer">
          <div className="user-status logged-in">
            <User size={20} />
            <span>Logged In</span>
          </div>
          
          {/* Theme Toggle */}
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            <Moon size={20} />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Header with Animation */}
        <header className="header">
          <div className="animation-container">
            <h1 className="animated-heading">
              I am a 
              <span
                ref={textRotateRef}
                className="txt-rotate"
              ></span>
            </h1>
          </div>
        </header>
        
        {/* Chat interface */}
        <div className="chat-section">
          {/* Chat Messages */}
          <div className="chat-messages" ref={chatBoxRef}>
            {messages.length === 0 ? (
              <div className="empty-chat-message">
                <h3>Welcome to the Chat!</h3>
                <p>Type a message below to get started or select a chapter from the sidebar.</p>
                <p>You can attach files to your messages using the paperclip icon.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message ${message.sender === 'user' ? 'user-message' : 'claude-message'}`}
                >
                  <div className="message-content">
                    {/* Make sure message.text is always a string */}
                    <p>{typeof message.text === 'string' ? message.text : 'Invalid message format'}</p>
                    {message.hasAttachment && (
                      <div className="attachment-indicator">
                        <Paperclip size={14} />
                        <span>File attached</span>
                      </div>
                    )}
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Chat Input */}
          <div className="chat-input-wrapper">
            {/* Hidden file input */}
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {/* File preview if file is selected */}
            {selectedFile && (
              <div className="selected-file-preview">
                <Paperclip size={16} />
                <span className="file-name">{selectedFile.name}</span>
                <button 
                  className="remove-file-button"
                  onClick={handleRemoveFile}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            <textarea 
              className="chat-input"
              placeholder="Ask Claude anything..."
              value={inputText}
              onChange={handleTextInputChange}
              onKeyPress={handleKeyPress}
              rows={3}
            />
            <div className="chat-input-buttons">
              <button 
                className="add-button"
                title="Attach file"
                onClick={handleAttachmentClick}
              >
                <Paperclip size={20} />
              </button>
              <button 
                className="send-button"
                onClick={handleSubmit}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}