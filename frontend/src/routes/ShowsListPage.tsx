import React from 'react';
import { useShows } from '../context/ShowContext';
import { ShowCard } from '../components/ShowCard';

const ShowsListPage = () => {
  const { shows, loading, error } = useShows();

  if (loading) {
    return <div className="loading">⏳ Loading shows...</div>;
  }

  if (error) {
    return <div className="error">❌ Error: {error}</div>;
  }

  if (shows.length === 0) {
    return <div className="empty">No shows available at the moment.</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', color: '#333' }}>🎬 Available Shows</h2>
      <div className="grid">
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>
    </div>
  );
};

export default ShowsListPage;
