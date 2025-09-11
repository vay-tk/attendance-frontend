import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { tokenManager } from '../utils/tokenManager';
import logger from '../utils/logger';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null
      };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = tokenManager.getAccessToken();
      if (!token) {
        dispatch({ type: 'AUTH_ERROR', payload: 'No token found' });
        return;
      }

      const response = await authAPI.getProfile();
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: response.data.data.user } });
    } catch (error) {
      logger.error('Auth check failed:', error);
      tokenManager.clearTokens();
      dispatch({ type: 'AUTH_ERROR', payload: 'Authentication failed' });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      const response = await authAPI.login(credentials);
      
      const { user, accessToken } = response.data.data;
      
      if (!accessToken) {
        throw new Error('No access token received');
      }
      
      tokenManager.setAccessToken(accessToken);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
      
      logger.info('User logged in successfully');
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      logger.error('Login failed:', error);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      const response = await authAPI.register(userData);
      
      const { user, accessToken } = response.data.data;
      
      if (!accessToken) {
        throw new Error('No access token received');
      }
      
      tokenManager.setAccessToken(accessToken);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
      
      logger.info('User registered successfully');
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      logger.error('Registration failed:', error);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      logger.error('Logout API call failed:', error);
    } finally {
      tokenManager.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
      logger.info('User logged out');
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await authAPI.resetPassword({ token, password });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;