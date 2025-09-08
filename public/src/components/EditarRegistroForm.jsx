import React, { useState } from 'react';

const EditarRegistroForm = ({ registro, onSuccess, onCancel }) => {
  const [articulo, setArticulo] = useState(registro.articulo);
  const [cantidad, setCantidad] = useState(registro.cantidad);
  const [codigo, setCodigo] = useState(registro.codigo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://suministros:3434/inventarios/${registro.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articulo, cantidad: Number(cantidad), codigo })
      });
      if (!res.ok) throw new Error('Error al editar el registro');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="editar-registro-form" onSubmit={handleSubmit} style={{
      display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem', padding: '8px 0'
    }}>
      <input
        type="text"
        placeholder="Artículo"
        value={articulo}
        onChange={e => setArticulo(e.target.value)}
        required
        style={{ padding: '10px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem' }}
      />
      <input
        type="number"
        placeholder="Cantidad"
        value={cantidad}
        onChange={e => setCantidad(e.target.value)}
        required
        min="1"
        style={{ padding: '10px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem' }}
      />
      <input
        type="text"
        placeholder="Código"
        value={codigo}
        onChange={e => setCodigo(e.target.value)}
        required
        style={{ padding: '10px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem' }}
      />
      <div style={{ display: 'flex', gap: '1rem', marginTop: 8 }}>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button className="btn btn-secondary" type="button" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </button>
      </div>
      {error && <div style={{ color: 'red', marginTop: 6 }}>{error}</div>}
    </form>
  );
};

export default EditarRegistroForm;
