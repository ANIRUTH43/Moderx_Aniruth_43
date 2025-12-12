import React, { useState } from 'react';
import { useShows } from '../context/ShowContext';
import { showsApi } from '../services/api';

const AdminPage = () => {
  const { shows, addShow } = useShows();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    total_seats: 50,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_seats' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await showsApi.createShow(formData.name, formData.start_time, formData.total_seats);
    if (result.error) {
      setError(result.error);
    } else if (result.data && typeof result.data === 'object') {
      addShow(result.data as any);
      setSuccess(`Show "${formData.name}" created successfully!`);
      setFormData({ name: '', start_time: '', total_seats: 50 });
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', color: '#333' }}>👨‍💼 Admin Panel</h2>
      
      <div className="content" style={{ maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Create New Show</h3>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Show Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Avengers Endgame"
            />
          </div>
          
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Total Seats</label>
            <input
              type="number"
              name="total_seats"
              value={formData.total_seats}
              onChange={handleChange}
              min="10"
              max="500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Creating...' : 'Create Show'}
          </button>
        </form>
      </div>

      <div className="content" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>All Shows</h3>
        {shows.length === 0 ? (
          <div className="empty">No shows created yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Show Name</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Start Time</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Total Seats</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => (
                <tr key={show.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem' }}>{show.name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {new Date(show.start_time).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{show.total_seats}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
