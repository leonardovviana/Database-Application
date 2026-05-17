import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      authService.me()
        .then(res => setUsuario({ ...res.data, cargo: getCargoFromToken() }))
        .catch(() => {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function getCargoFromToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.cargo;
    } catch {
      return null;
    }
  }

  async function login(email, senha) {
    const res = await authService.login(email, senha);
    const { token, usuario: user } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUsuario(user);
    return user;
  }

  async function register(data) {
    const res = await authService.register(data);
    const { token, usuario: user } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUsuario(user);
    return user;
  }

  function logout() {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUsuario(null);
  }

  function redirectPath() {
    if (!usuario) return '/login';
    if (usuario.cargo === 'cliente') return '/cliente/dashboard';
    return '/admin';
  }

  return (
    <AuthContext.Provider value={{ usuario, login, register, logout, loading, redirectPath }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
