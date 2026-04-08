import React, { useState, useEffect } from 'react';
import api from './services';
import { Member } from './types';

interface AuthContextType {
  user: any | null;
  member: any | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  member: null,
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('memberflow_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setMember(res.data.user);
          setIsAdmin(res.data.user.role === 'org_admin' || res.data.user.role === 'super_admin');
          setIsSuperAdmin(res.data.user.role === 'super_admin');
        } catch (err) {
          localStorage.removeItem('memberflow_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
     const res = await api.post('/auth/login', { email, password });
     localStorage.setItem('memberflow_token', res.data.token);
     setUser(res.data.user);
     setMember(res.data.user);
     setIsAdmin(res.data.user.role === 'org_admin' || res.data.user.role === 'super_admin');
     setIsSuperAdmin(res.data.user.role === 'super_admin');
  };

  const logout = () => {
    localStorage.removeItem('memberflow_token');
    setUser(null);
    setMember(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, member, loading, isAdmin, isSuperAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
