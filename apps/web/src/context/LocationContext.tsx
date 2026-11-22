'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LocationState {
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
  isCustom: boolean;
}

export const PRESET_LOCATIONS: { name: string; lat: number; lng: number }[] = [
  { name: 'Vijay Nagar, Indore', lat: 22.7533, lng: 75.8937 },
  { name: 'Old Palasia / 56 Dukan, Indore', lat: 22.7244, lng: 75.8839 },
  { name: 'Bhawarkua / Tower Square, Indore', lat: 22.6926, lng: 75.8676 },
  { name: 'Dawa Bazar / R.N.T. Marg, Indore', lat: 22.7150, lng: 75.8650 },
  { name: 'Geeta Bhawan / A.B. Road, Indore', lat: 22.7167, lng: 75.8828 },
  { name: 'Annapurna Road, Indore', lat: 22.6974, lng: 75.8322 },
  { name: 'MR-10 / Bapat Square, Indore', lat: 22.7661, lng: 75.8753 },
  { name: 'Rajwada / Sarafa, Indore', lat: 22.7185, lng: 75.8550 },
  { name: 'Central Delhi / Connaught Place', lat: 28.6315, lng: 77.2167 },
  { name: 'South Delhi / Green Park', lat: 28.5588, lng: 77.2028 },
  { name: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
  { name: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408 }
];

interface LocationContextType {
  location: LocationState;
  setLocation: (loc: Partial<LocationState>) => void;
  setRadius: (radiusKm: number) => void;
  detectCurrentLocation: () => Promise<void>;
  isDetecting: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationState>({
    name: 'Vijay Nagar, Indore',
    lat: 22.7533,
    lng: 75.8937,
    radiusKm: 5,
    isCustom: false
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLocation = (loc: Partial<LocationState>) => {
    setLocationState((prev) => ({ ...prev, ...loc }));
  };

  const setRadius = (radiusKm: number) => {
    setLocationState((prev) => ({ ...prev, radiusKm }));
  };

  const detectCurrentLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationState((prev) => ({
            ...prev,
            name: 'My GPS Location',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            isCustom: true
          }));
          setIsDetecting(false);
          resolve();
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err.message);
          setError('Location permission denied. Defaulted to Vijay Nagar, Indore.');
          setIsDetecting(false);
          resolve();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        setRadius,
        detectCurrentLocation,
        isDetecting,
        error
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
