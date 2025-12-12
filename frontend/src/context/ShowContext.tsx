import React, { createContext, useContext, useState, useEffect } from 'react';
import { showsApi } from '../services/api';


export interface Show {
  id: number;
  name: string;
  start_time: string;
  total_seats: number;
}

interface ShowContextType {
  shows: Show[];
  loading: boolean;
  error: string | null;
  fetchShows: () => Promise<void>;
  addShow: (show: Show) => void;
}

const ShowContext = createContext<ShowContextType | undefined>(undefined);

export const ShowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShows = async () => {
    setLoading(true);
    setError(null);
    const response = await showsApi.getShows();
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setShows(response.data as Show[]);;
    }
    setLoading(false);
  };

  const addShow = (show: Show) => {
    setShows((prev) => [show, ...prev]);
  };

  useEffect(() => {
    fetchShows();
  }, []);

  return (
    <ShowContext.Provider value={{ shows, loading, error, fetchShows, addShow }}>
      {children}
    </ShowContext.Provider>
  );
};

export const useShows = () => {
  const context = useContext(ShowContext);
  if (!context) {
    throw new Error('useShows must be used within ShowProvider');
  }
  return context;
};
