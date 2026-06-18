import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Requests from './pages/Requests';

export const UserContext = createContext();

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('user');
    if (!token || !raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });

  useEffect(()=> {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <nav>
          <div className="nav-left">
            <Link to="/" className="brand">SlotSwapper</Link>
            <Link to="/">Dashboard</Link>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/requests">Requests</Link>
          </div>
          {user ? (
            <div className="nav-right">
              <span>Hi, {user.name}</span>
              <button onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="nav-right">
              <Link to="/login">Login</Link>
              <Link to="/signup" style={{ marginLeft: 8 }}>Signup</Link>
            </div>
          )}
        </nav>

        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute user={user}><Marketplace /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute user={user}><Requests /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default App;
