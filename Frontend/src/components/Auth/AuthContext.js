import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null means not logged in
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Persistent login: check for token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (storedToken) {
      setToken(storedToken);
      
      // Clear expired tokens immediately
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          return;
        }
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        return;
      }

      // If we have stored user data, use it immediately
      if (storedUser) {
        setUser(storedUser);
      }
      
      // Verify and refresh user data from server
      api
        .get('/auth/me')
        .then((res) => {
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        })
        .catch((error) => {
          console.error('Session verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        });
    }
  }, []);

  const login = (userData) => {
    if (!userData || !userData.token || !userData.user) {
      console.error('Invalid login data:', userData);
      return;
    }
    
    // Ensure the user object has the correct role
    const userObj = {
      ...userData.user,
      role: userData.user.role.toLowerCase()
    };
    
    console.log('🔑 Setting auth state:', { 
      user: userObj, 
      role: userObj.role,
      token: userData.token?.slice(0, 10) + '...' 
    });
    
    // Update state
    setUser(userObj);
    setToken(userData.token);
    
    // Update localStorage
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userObj));
    
    // Update axios default headers
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    
    // Clear state
    setUser(null);
    setToken(null);
    
    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear axios headers
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 