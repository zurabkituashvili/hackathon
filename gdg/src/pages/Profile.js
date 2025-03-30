import React, { useState } from 'react';
import './Profile.css';
import { User, Package, Home, LogIn, Moon, ChevronDown, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const Profile = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
  // Sample events for the calendar
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Web Development Assignment',
      start: new Date(2025, 2, 10, 10, 0), // March 10, 2025, 10:00 AM
      end: new Date(2025, 2, 10, 12, 0),   // March 10, 2025, 12:00 PM
      difficulty: 'Beginner'
    },
    {
      id: 2,
      title: 'Data Science Project',
      start: new Date(2025, 2, 15, 14, 0), // March 15, 2025, 2:00 PM
      end: new Date(2025, 2, 15, 16, 0),   // March 15, 2025, 4:00 PM
      difficulty: 'Medium'
    },
    {
      id: 3,
      title: 'UI/UX Design Challenge',
      start: new Date(2025, 2, 20, 9, 0),  // March 20, 2025, 9:00 AM
      end: new Date(2025, 2, 20, 11, 0),   // March 20, 2025, 11:00 AM
      difficulty: 'Difficult'
    }
  ]);
  
  const toggleCourse = (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
    }
  };
  
  const courses = [
    {
      id: 'web-dev',
      title: 'Web Development',
      icon: <Package size={20} />,
      chapters: [
        'HTML Fundamentals',
        'CSS Layouts',
        'JavaScript Basics',
        'React Components',
        'State Management'
      ]
    },
    {
      id: 'data-science',
      title: 'Data Science',
      icon: <Book size={20} />,
      chapters: [
        'Python Basics',
        'Data Visualization',
        'Statistical Methods',
        'Machine Learning',
        'Deep Learning'
      ]
    },
    {
      id: 'design',
      title: 'UI/UX Design',
      icon: <Package size={20} />,
      chapters: [
        'Design Principles',
        'Color Theory',
        'Typography',
        'Wireframing',
        'Prototyping'
      ]
    }
  ];

  // Custom event styling based on difficulty
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad'; // default color
    
    if (event.difficulty === 'Beginner') {
      backgroundColor = '#4caf50'; // green
    } else if (event.difficulty === 'Medium') {
      backgroundColor = '#ff9800'; // orange
    } else if (event.difficulty === 'Difficult') {
      backgroundColor = '#f44336'; // red
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Handler for adding new events
  const handleSelect = ({ start, end }) => {
    const title = window.prompt('New Event name');
    if (title) {
      const difficulty = window.prompt('Difficulty (Beginner, Medium, Difficult)');
      setEvents([
        ...events,
        {
          id: events.length + 1,
          title,
          start,
          end,
          difficulty: difficulty || 'Beginner'
        }
      ]);
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>     
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
          <Link to='/mywork' label="My work" className="nav-item nav-page">
            <User size={20} />
            <span>My work</span>
          </Link>
          <Link to='/' label="Dashboard" className="nav-item nav-page" >
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
                      courses.map(course => (
                        <div key={course.id} className="course-dropdown">
                          <div 
                            className={`nav-item course-header ${expandedCourse === course.id ? 'active' : ''}`}
                            onClick={() => toggleCourse(course.id)}
                          >
                            <Book size={20} />
                            <span>{course.title}</span>
                            <ChevronDown 
                              size={16} 
                              className={`dropdown-icon ${expandedCourse === course.id ? 'expanded' : ''}`} 
                            />
                          </div>
                          
                          {expandedCourse === course.id && (
                            <div className="chapter-list">
                              {course.chapters && course.chapters.length > 0 ? (
                                course.chapters.map((chapter, index) => (
                                  <div 
                                    key={index} 
                                    className="chapter-item"
                                    onClick={() => {
                                      // Handle chapter selection logic here
                                    }}
                                  >
                                    <span className="chapter-bullet">•</span>
                                    <span className="chapter-title">{chapter.title || chapter}</span>
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
        
        {/* Sign In Button */}
        <div className="sidebar-footer">
          <Link to='/login' className="sign-in-button">
            <LogIn size={20} />
            <span>Sign in</span>
          </Link>
          
          {/* Theme Toggle */}
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            <Moon size={20} />
          </button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="profile-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1>Welcome</h1>
            
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-avatar">
                <img src="/api/placeholder/60/60" alt="Profile avatar" />
              </div>
              <div className="profile-info">
                <h2>John Doe <span className="rank-badge">Grandmaster</span></h2>
                <p className="profile-username">@johndoe</p>
              </div>
            </div>
          </div>

          {/* Calendar Section with react-big-calendar */}
          <div className="calendar-section">
            <h2>Your Learning Schedule</h2>
            <div className="difficulty-legend">
            </div>
            <div className="calendar-container">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    eventPropGetter={eventStyleGetter}
                    selectable
                    onSelectSlot={handleSelect}
                    onSelectEvent={event => alert(event.title)}
                    views={['month', 'week', 'day']}
                    defaultView="month"
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;