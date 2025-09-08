import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from "docx";

const LOCAL_KEY = "notaPedidoSemanal";

function guardarNota(nota) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(nota));
}
function cargarNota() {
  const nota = localStorage.getItem(LOCAL_KEY);
  return nota ? JSON.parse(nota) : null;
}
function limpiarNota() {
  localStorage.removeItem(LOCAL_KEY);
}


export default function NotaPedidoSemanal() {
  const [fechaApertura, setFechaApertura] = useState("");
  const [fechaCierre, setFechaCierre] = useState("");
  const [articulo, setArticulo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [observacion, setObservacion] = useState("");
  const [items, setItems] = useState([]);
  const [cerrada, setCerrada] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const nota = cargarNota();
    if (nota) {
      setFechaApertura(nota.fechaApertura);
      setFechaCierre(nota.fechaCierre);
      setItems(nota.items || []);
      setCerrada(nota.cerrada || false);
    }
  }, []);

  useEffect(() => {
    guardarNota({ fechaApertura, fechaCierre, items, cerrada });
  }, [fechaApertura, fechaCierre, items, cerrada]);

  function agregarItem() {
    if (!articulo || !cantidad) return;
    setItems([...items, { articulo, cantidad, observacion }]);
    setArticulo("");
    setCantidad("");
    setObservacion("");
  }
  function quitarItem(idx) {
    setItems(items.filter((_, i) => i !== idx));
  }
  function cerrarNota() {
    setCerrada(true);
  }
  function nuevaNota() {
    setFechaApertura("");
    setFechaCierre("");
    setItems([]);
    setCerrada(false);
    limpiarNota();
  }

  async function descargarDocx() {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph("Artículo")] }),
          new TableCell({ children: [new Paragraph("Cantidad")] }),
          new TableCell({ children: [new Paragraph("Observación")] }),
        ],
      }),
      ...items.map(item => new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(item.articulo)] }),
          new TableCell({ children: [new Paragraph(String(item.cantidad))] }),
          new TableCell({ children: [new Paragraph(item.observacion || "")] }),
        ],
      }))
    ];
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: `Nota de Pedido Semanal`, heading: "HEADING_1" }),
          new Paragraph({ text: `Apertura: ${fechaApertura}`, spacing: { after: 100 } }),
          new Paragraph({ text: `Cierre: ${fechaCierre}`, spacing: { after: 200 } }),
          new Table({ rows: tableRows })
        ]
      }]
    });
    const buffer = await Packer.toBlob(doc);
    const url = URL.createObjectURL(buffer);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nota-pedido-semanal.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page" style={{ maxWidth: 600 }}>
        {/* Flecha para retroceder */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          fontSize: '1rem',
          color: '#1976d2',
          fontWeight: 600
        }}
        aria-label="Volver"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
          <path d="M15 18L9 12L15 6" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver
      </button>
      <h2 style={{ fontWeight: 600, color: '#2d3e50', marginBottom: 24 }}>Nota de Pedido Semanal</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500 }}>Fecha de apertura<br />
            <input type="date" className="input" value={fechaApertura} onChange={e => setFechaApertura(e.target.value)} disabled={cerrada} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }} />
          </label>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500 }}>Fecha de cierre<br />
            <input type="date" className="input" value={fechaCierre} onChange={e => setFechaCierre(e.target.value)} disabled={cerrada} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }} />
          </label>
        </div>
      </div>
      {!cerrada && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input className="input" placeholder="Artículo" value={articulo} onChange={e => setArticulo(e.target.value)} style={{ flex: 2, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
          <input className="input" placeholder="Cantidad" type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
          <input className="input" placeholder="Observación" value={observacion} onChange={e => setObservacion(e.target.value)} style={{ flex: 2, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
          <button className="btn btn-success" onClick={agregarItem}>Agregar</button>
        </div>
      )}
      <table style={{ width: "100%", marginBottom: 24, borderCollapse: 'collapse', fontSize: 15 }}>
        <thead>
          <tr style={{ background: '#f0f4f8', color: '#2d3e50' }}>
            <th style={{ padding: 8, borderBottom: '1px solid #e0e0e0' }}>Artículo</th>
            <th style={{ padding: 8, borderBottom: '1px solid #e0e0e0' }}>Cantidad</th>
            <th style={{ padding: 8, borderBottom: '1px solid #e0e0e0' }}>Observación</th>
            {!cerrada && <th style={{ padding: 8, borderBottom: '1px solid #e0e0e0' }}>Quitar</th>}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={cerrada ? 3 : 4} style={{ textAlign: 'center', color: '#888', padding: 16 }}>Sin artículos cargados</td></tr>
          ) : items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: 8 }}>{item.articulo}</td>
              <td style={{ padding: 8 }}>{item.cantidad}</td>
              <td style={{ padding: 8 }}>{item.observacion}</td>
              {!cerrada && <td style={{ padding: 8 }}><button className="btn btn-warning" onClick={() => quitarItem(idx)}>Quitar</button></td>}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="main-buttons" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {!cerrada ? (
          <button className="btn btn-primary" onClick={cerrarNota} disabled={!fechaApertura || !fechaCierre || items.length === 0}>Cerrar nota</button>
        ) : (
          <>
            <button className="btn btn-info" onClick={descargarDocx}>Descargar .docx</button>
            <button className="btn btn-secondary" onClick={nuevaNota}>Nueva nota</button>
          </>
        )}
      </div>
    </div>
  );
}
