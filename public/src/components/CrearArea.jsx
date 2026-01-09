import React, { useState } from 'react';

const CrearArea = ({ onCreate }) => {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_URL}/areas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear área');
      }
      setNombre('');
      setSuccess('Área creada correctamente');
      if (onCreate) onCreate();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      <input type="text" placeholder="Nombre del área" value={nombre} onChange={e => setNombre(e.target.value)} required />
      <button className="btn btn-primary" type="submit">Crear área</button>
      {error && <span style={{ color: 'red' }}>{error}</span>}
      {success && <span style={{ color: 'green' }}>{success}</span>}
    </form>
  );
};

export default CrearArea;
