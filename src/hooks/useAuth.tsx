
import { useEffect, useState } from 'react';
import { useToast } from './use-toast';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('jwt_token');

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          throw new Error('Token expired');
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('jwt_token');
        setIsAuthenticated(false);
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive"
        });
      }
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  return {
    isAuthenticated,
    loading,
    logout,
    checkAuth
  };
};
