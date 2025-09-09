import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Acepta dos formas de 'grupos':
// 1) Forma anidada: { [area]: { [destinatario]: Salida[] } }
// 2) Forma plana (actual en SalidasPage): { [destinatario]: Salida[] }
export const generarReportePDF = (grupos, mes, año) => {
  if (!grupos || Object.keys(grupos).length === 0) {
    console.warn('No hay datos para generar el PDF');
    return;
  }

  const doc = new jsPDF();
  const topKeys = Object.keys(grupos);
  const isFlat = topKeys.every(k => Array.isArray(grupos[k])); // si todas las claves apuntan a arrays => agrupado por destinatario

  // Construimos un mapa destinatario -> { area -> Salida[] }
  const mapa = {};
  if (isFlat) {
    // topKeys son destinatarios
    topKeys.forEach(dest => {
      const lista = grupos[dest] || [];
      lista.forEach(s => {
        const area = s.area || 'Sin área';
        if (!mapa[dest]) mapa[dest] = {};
        if (!mapa[dest][area]) mapa[dest][area] = [];
        mapa[dest][area].push(s);
      });
    });
  } else {
    // topKeys son áreas -> dentro hay destinatarios
    topKeys.forEach(area => {
      const porDest = grupos[area] || {};
      Object.keys(porDest).forEach(dest => {
        if (!mapa[dest]) mapa[dest] = {};
        if (!mapa[dest][area]) mapa[dest][area] = [];
        // Aseguramos que porDest[dest] sea array
        const value = porDest[dest];
        if (Array.isArray(value)) {
          mapa[dest][area] = mapa[dest][area].concat(value);
        } else if (value && typeof value === 'object') {
          // Si accidentalmente vino un objeto suelto, lo envolvemos
            mapa[dest][area].push(value);
        }
      });
    });
  }

  const destinatarios = Object.keys(mapa).sort();

  destinatarios.forEach((destinatario, index) => {
    if (index > 0) doc.addPage(); // cada destinatario en nueva página

    doc.setFontSize(16);
    doc.text(`Reporte de Salidas - ${mes}/${año}`.trim(), 14, 18);

    doc.setFontSize(14);
    doc.text(`Destinatario: ${destinatario}`.trim(), 14, 28);

    let posY = 38;
    const areas = Object.keys(mapa[destinatario]).sort();
    if (areas.length === 0) {
      doc.setFontSize(11);
      doc.text('Sin datos para este destinatario', 14, posY);
      return;
    }

    areas.forEach(area => {
      const lista = mapa[destinatario][area] || [];
      if (!Array.isArray(lista) || lista.length === 0) return;

      doc.setFontSize(12);
      doc.text(`Área: ${area}`, 14, posY);

      const rows = lista.map(s => [
        (s.fecha ? s.fecha.slice(0,10).split('-').reverse().join('-') : ''),
        s.articulo || '',
        s.cantidad ?? ''
      ]);

      autoTable(doc, {
        startY: posY + 5,
        head: [["Fecha", "Artículo", "Cantidad"]],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [31,78,121] }
      });

      posY = (doc.lastAutoTable?.finalY || posY) + 12;
      // Salto de página si se acerca al final
      if (posY > 260) {
        doc.addPage();
        posY = 20;
      }
    });
  });

  doc.save(`reporte-salidas-${mes}-${año}.pdf`);
};