import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling geolocation
 * Returns current position, loading state, and error
 */
export const useGeolocation = (options = {}) => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000, // Cache position for 1 minute
    ...options,
  };

  const getPosition = useCallback(() => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by your browser',
      });
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setIsLoading(false);
      },
      (err) => {
        let message;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location services.';
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Location unavailable. Try again outside.';
            break;
          case err.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
          default:
            message = 'An unknown error occurred.';
        }
        setError({ code: err.code, message });
        setIsLoading(false);
      },
      defaultOptions
    );
  }, []);

  // Get position on mount
  useEffect(() => {
    getPosition();
  }, [getPosition]);

  // Watch position changes
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
      },
      () => {}, // Silently ignore watch errors
      { ...defaultOptions, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return {
    position,
    error,
    isLoading,
    refresh: getPosition,
  };
};

export default useGeolocation;
