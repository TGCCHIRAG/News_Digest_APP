import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Newspaper, Loader2 } from 'lucide-react';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route element={<Layout />}>
          <Route
            path="/"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;