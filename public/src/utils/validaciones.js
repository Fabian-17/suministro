/**
 * Validaciones para formularios
 */

export const validarArticulo = (articulo) => {
  if (!articulo || articulo.trim() === '') {
    return 'El nombre del artículo es requerido';
  }
  if (articulo.length < 3) {
    return 'El nombre debe tener al menos 3 caracteres';
  }
  return null;
};

export const validarCantidad = (cantidad) => {
  const num = Number(cantidad);
  if (isNaN(num) || num <= 0) {
    return 'La cantidad debe ser un número mayor a 0';
  }
  if (!Number.isInteger(num)) {
    return 'La cantidad debe ser un número entero';
  }
  return null;
};

export const validarCodigo = (codigo) => {
  if (!codigo || codigo.trim() === '') {
    return 'El código es requerido';
  }
  return null;
};

export const validarFecha = (fecha) => {
  if (!fecha) {
    return 'La fecha es requerida';
  }
  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) {
    return 'La fecha no es válida';
  }
  if (fechaObj > new Date()) {
    return 'La fecha no puede ser futura';
  }
  return null;
};

export const validarDestinatario = (destinatario) => {
  if (!destinatario || destinatario.trim() === '') {
    return 'El destinatario es requerido';
  }
  return null;
};

export const validarArea = (area) => {
  if (!area || area.trim() === '') {
    return 'El área es requerida';
  }
  return null;
};

/**
 * Valida un formulario completo
 * @param {object} data - Datos del formulario
 * @param {array} campos - Array de campos a validar
 * @returns {object} - { valido: boolean, errores: object }
 */
export const validarFormulario = (data, campos) => {
  const errores = {};
  
  const validadores = {
    articulo: validarArticulo,
    cantidad: validarCantidad,
    codigo: validarCodigo,
    fecha: validarFecha,
    destinatario: validarDestinatario,
    area: validarArea,
  };

  campos.forEach(campo => {
    if (validadores[campo]) {
      const error = validadores[campo](data[campo]);
      if (error) {
        errores[campo] = error;
      }
    }
  });

  return {
    valido: Object.keys(errores).length === 0,
    errores
  };
};
