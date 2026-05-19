import React, { useRef } from 'react';
import '../styles/SolicitudPrint.css';

const SolicitudPrintView = ({ solicitud, onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  // Formatear fecha en español (ej: "Martes 19 de mayo de 2026")
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    return `${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
  };

  // Crear array de 40 filas
  const filasTabla = Array.from({ length: 40 }, (_, index) => {
    const item = solicitud.items && solicitud.items[index];
    return {
      numero: index + 1,
      cantidad: item?.cantidad_solicitada || '',
      descripcion: item?.articulo || ''
    };
  });

  // Calcular total de cantidades
  const totalCantidades = solicitud.items?.reduce((sum, item) => sum + (item.cantidad_solicitada || 0), 0) || 0;

  return (
    <div className="print-modal-overlay">
      <div className="print-modal-content">
        {/* Botones de acción - no se imprimen */}
        <div className="print-actions no-print">
          <button onClick={handlePrint} className="btn-print">
            🖨️ Imprimir
          </button>
          <button onClick={onClose} className="btn-close">
            ❌ Cerrar
          </button>
        </div>

        {/* Documento para imprimir */}
        <div className="print-document" ref={printRef}>
          {/* Fecha */}
          <div className="print-fecha">
            {formatearFecha(solicitud.fecha_solicitud)}
          </div>

          {/* De */}
          <div className="print-de">
            <strong>DE:</strong> {solicitud.usuario?.encargado?.nombre || 'N/A'} - {solicitud.usuario?.username || 'N/A'}
          </div>

          {/* A + Justificación */}
          <div className="print-para">
            <strong>A DIRECCION DE SUMINISTRO:</strong> Solicito la provisión de los siguientes ARTICULOS,
            enumerados al pie para: <span className="print-justificacion">{solicitud.justificacion || 'N/A'}</span>
          </div>

          {/* Tabla */}
          <table className="print-tabla">
            <thead>
              <tr>
                <th className="col-item">ITEM</th>
                <th className="col-cant">CANT.</th>
                <th className="col-descripcion">DESCRIPCION</th>
              </tr>
            </thead>
            <tbody>
              {filasTabla.map((fila) => (
                <tr key={fila.numero}>
                  <td className="col-item">{fila.numero}</td>
                  <td className="col-cant">{fila.cantidad}</td>
                  <td className="col-descripcion">{fila.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total de cantidades */}
          <div className="print-total">
            <div className="total-box">
              <strong>{totalCantidades}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudPrintView;
