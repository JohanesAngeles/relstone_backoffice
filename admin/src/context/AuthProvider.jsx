import { useState } from 'react';
import AuthContext from './AuthContext';

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || null);

  const login = (newToken) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;