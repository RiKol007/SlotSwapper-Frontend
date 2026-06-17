import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Requests from './pages/Requests';
import { auth } from './api';

export const UserContext = createContext();

function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
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
        <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
          <Link to="/" style={{ marginRight: 8 }}>Dashboard</Link>
          <Link to="/marketplace" style={{ marginRight: 8 }}>Marketplace</Link>
          <Link to="/requests" style={{ marginRight: 8 }}>Requests</Link>
          {user ? (
            <>
              <span style={{ marginLeft: 12 }}>Hi, {user.name}</span>
              <button style={{ marginLeft: 8 }} onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginLeft: 12 }}>Login</Link>
              <Link to="/signup" style={{ marginLeft: 8 }}>Signup</Link>
            </>
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
