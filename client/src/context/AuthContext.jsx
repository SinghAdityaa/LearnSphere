import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async googleLogin(credential) {
      const { data } = await api.post('/auth/google', { credential });
      setUser(data.user);
      return data.user;
    },
    async devLogin(role = 'student') {
      const { data } = await api.post('/auth/dev-login', { role });
      setUser(data.user);
      return data.user;
    },
    async updateProfile(name) {
      const { data } = await api.patch('/auth/me', { name });
      setUser(data.user);
      return data.user;
    },
    async logout() {
      await api.post('/auth/logout');
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
