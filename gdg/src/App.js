import logo from './logo.svg';
import './App.css';
import Dashboard from './pages/Dashboard';
import Mywork from './pages/Profile'
import Auth from './pages/Auth'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
        <Router>
                <div style={{ flex: 1, padding: '0' }}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/mywork" element={<Mywork />} />

                    <Route path="/login" element={<Auth />} />
                  </Routes>
                </div>
        </Router>
    </div>
  );
}

export default App;
