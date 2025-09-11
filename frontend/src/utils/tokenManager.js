const ACCESS_TOKEN_KEY = 'access_token';

export const tokenManager = {
  getAccessToken: () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken: (token) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  removeAccessToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    // Clear any other auth-related data
    localStorage.removeItem('user_data');
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },
};