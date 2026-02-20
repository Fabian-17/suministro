import * as XLSX from 'xlsx-js-style';

/**
 * Formatea una fecha a formato dd-mm-yyyy
 */
const formatFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const [y, m, d] = fechaStr.slice(0, 10).split('-');
  return `${d}-${m}-${y}`;
};

/**
 * Aplica estilos a una hoja de Excel con grupos por destinatario
 */
const aplicarEstilos = (ws, salidasOrdenadas) => {
  const range = XLSX.utils.decode_range(ws['!ref']);
  
  // Estilos para el encabezado
  const estiloEncabezado = {
    font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: false },
    border: {
      top: { style: "medium", color: { rgb: "000000" } },
      bottom: { style: "medium", color: { rgb: "000000" } },
      left: { style: "medium", color: { rgb: "000000" } },
      right: { style: "medium", color: { rgb: "000000" } }
    }
  };
  
  // Identificar cambios de destinatario para los recuadros
  const cambiosDestinatario = [0]; // Primera fila de datos (índice 0)
  let destinatarioActual = salidasOrdenadas[0]?.destinatario;
  
  for (let i = 1; i < salidasOrdenadas.length; i++) {
    if (salidasOrdenadas[i].destinatario !== destinatarioActual) {
      cambiosDestinatario.push(i);
      destinatarioActual = salidasOrdenadas[i].destinatario;
    }
  }
  
  // Aplicar estilos celda por celda
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      
      if (!ws[cellAddress]) continue;
      
      // Aplicar estilos al encabezado (primera fila)
      if (R === 0) {
        ws[cellAddress].s = estiloEncabezado;
      } else {
        // Determinar si es primera fila de un grupo o última
        const filaIndex = R - 1; // Índice en el array de salidas (sin contar header)
        const esPrimeraDeGrupo = cambiosDestinatario.includes(filaIndex);
        const esUltimaDeGrupo = filaIndex === salidasOrdenadas.length - 1 || 
                                 cambiosDestinatario.includes(filaIndex + 1);
        const esPrimeraColumna = C === 0;
        const esUltimaColumna = C === range.e.c;
        
        // Todas las celdas tienen borde completo gris claro (recuadro por fila)
        // Los bordes externos del grupo se reemplazan con negro grueso
        const estiloBase = {
          fill: { fgColor: { rgb: "FFFFFF" } },
          border: {
            // Borde superior
            top: { 
              style: esPrimeraDeGrupo ? "medium" : "thin", 
              color: { rgb: esPrimeraDeGrupo ? "000000" : "C0C0C0" } 
            },
            // Borde inferior
            bottom: { 
              style: esUltimaDeGrupo ? "medium" : "thin", 
              color: { rgb: esUltimaDeGrupo ? "000000" : "C0C0C0" } 
            },
            // Borde izquierdo
            left: { 
              style: esPrimeraColumna ? "medium" : "thin", 
              color: { rgb: esPrimeraColumna ? "000000" : "C0C0C0" } 
            },
            // Borde derecho
            right: { 
              style: esUltimaColumna ? "medium" : "thin", 
              color: { rgb: esUltimaColumna ? "000000" : "C0C0C0" } 
            }
          },
          alignment: { vertical: "center" }
        };
        
        // Alineación específica por columna
        if (C === 3) { // Columna Cantidad (índice 3)
          estiloBase.alignment = { horizontal: "right", vertical: "center" };
          estiloBase.numFmt = "#,##0"; // Formato numérico con separador de miles
        } else if (C === 5) { // Columna Fecha (índice 5)
          estiloBase.alignment = { horizontal: "center", vertical: "center" };
        } else {
          estiloBase.alignment = { horizontal: "left", vertical: "center" };
        }
        
        ws[cellAddress].s = estiloBase;
      }
    }
  }
  
  return ws;
};

/**
 * Exportar salidas a Excel ordenadas por destinatario y luego por artículo
 */
export const exportarSalidasPorDestinatarioYArticulo = (salidas) => {
  if (!salidas || salidas.length === 0) {
    alert('No hay salidas para exportar');
    return;
  }

  // Ordenar por destinatario y luego por artículo
  const salidasOrdenadas = [...salidas].sort((a, b) => {
    const destA = (a.destinatario || '').toLowerCase();
    const destB = (b.destinatario || '').toLowerCase();
    
    // Primero ordenar por destinatario
    const compDest = destA.localeCompare(destB);
    if (compDest !== 0) return compDest;
    
    // Si el destinatario es igual, ordenar por artículo
    const artA = (a.articulo || '').toLowerCase();
    const artB = (b.articulo || '').toLowerCase();
    return artA.localeCompare(artB);
  });

  // Preparar datos para Excel
  const datos = salidasOrdenadas.map(salida => ({
    'Destinatario': salida.destinatario || '',
    'Artículo': salida.articulo || '',
    'Código': salida.codigo || '',
    'Cantidad': salida.cantidad || 0,
    'Área': salida.area || '',
    'Fecha': formatFecha(salida.fecha)
  }));

  // Crear libro de trabajo
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(datos);

  // Ajustar anchos de columna (en caracteres)
  ws['!cols'] = [
    { wch: 28 }, // Destinatario
    { wch: 38 }, // Artículo
    { wch: 16 }, // Código
    { wch: 11 }, // Cantidad
    { wch: 24 }, // Área
    { wch: 13 }  // Fecha
  ];

  // Aplicar estilos con grupos por destinatario
  aplicarEstilos(ws, salidasOrdenadas);

  // Configurar altura de filas
  if (!ws['!rows']) ws['!rows'] = [];
  ws['!rows'][0] = { hpt: 25 }; // Altura del encabezado

  // Agregar filtros automáticos
  ws['!autofilter'] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(ws['!ref'])) };

  XLSX.utils.book_append_sheet(wb, ws, 'Salidas');

  // Generar archivo
  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Salidas_${fecha}.xlsx`, { 
    bookType: 'xlsx',
    cellStyles: true
  });
};
