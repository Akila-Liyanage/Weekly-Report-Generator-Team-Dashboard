import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('weeklyhub_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('weeklyhub_token')));

  useEffect(() => {
    const token = localStorage.getItem('weeklyhub_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('weeklyhub_user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('weeklyhub_token');
        localStorage.removeItem('weeklyhub_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function saveSession(data) {
    localStorage.setItem('weeklyhub_token', data.token);
    localStorage.setItem('weeklyhub_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    saveSession(data);
    return data.user;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    saveSession(data);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('weeklyhub_token');
    localStorage.removeItem('weeklyhub_user');
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    isManager: user?.role === 'MANAGER',
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
