import { useState, useEffect } from 'react';
import logger from '../utils/logger';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
    ...options
  };

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        setLocation(locationData);
        setLoading(false);
        logger.info('Location obtained:', locationData);
      },
      (err) => {
        let errorMessage = 'Failed to get location';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setError(errorMessage);
        setLoading(false);
        logger.error('Geolocation error:', err);
      },
      defaultOptions
    );
  };

  const watchPosition = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        setError(null);
      },
      (err) => {
        setError(`Geolocation error: ${err.message}`);
        logger.error('Geolocation watch error:', err);
      },
      defaultOptions
    );
  };

  useEffect(() => {
    if (options.watch) {
      const watchId = watchPosition();
      return () => {
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    }
  }, [options.watch]);

  return {
    location,
    error,
    loading,
    getCurrentPosition,
    watchPosition
  };
};