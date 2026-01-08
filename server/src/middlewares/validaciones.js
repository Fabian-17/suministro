/**
 * Middleware para validar datos de entrada
 */

export const validarSalida = (req, res, next) => {
  const { articulo, cantidad, codigo, area, destinatario, fecha } = req.body;
  const errores = [];

  if (!articulo || articulo.trim() === '') {
    errores.push('El artículo es requerido');
  }

  if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
    errores.push('La cantidad debe ser un número mayor a 0');
  }

  if (!codigo || codigo.trim() === '') {
    errores.push('El código es requerido');
  }

  if (!area || area.trim() === '') {
    errores.push('El área es requerida');
  }

  if (!destinatario || destinatario.trim() === '') {
    errores.push('El destinatario es requerido');
  }

  if (!fecha) {
    errores.push('La fecha es requerida');
  }

  if (errores.length > 0) {
    return res.status(400).json({ 
      error: 'Datos inválidos', 
      detalles: errores 
    });
  }

  next();
};

export const validarEntrada = (req, res, next) => {
  const { articulo, cantidad, codigo, fecha } = req.body;
  const errores = [];

  if (!articulo || articulo.trim() === '') {
    errores.push('El artículo es requerido');
  }

  if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
    errores.push('La cantidad debe ser un número mayor a 0');
  }

  if (!codigo || codigo.trim() === '') {
    errores.push('El código es requerido');
  }

  if (!fecha) {
    errores.push('La fecha es requerida');
  }

  if (errores.length > 0) {
    return res.status(400).json({ 
      error: 'Datos inválidos', 
      detalles: errores 
    });
  }

  next();
};

export const validarInventario = (req, res, next) => {
  const { articulo, cantidad, codigo } = req.body;
  const errores = [];

  if (!articulo || articulo.trim() === '') {
    errores.push('El artículo es requerido');
  }

  if (!cantidad || isNaN(cantidad) || cantidad < 0) {
    errores.push('La cantidad debe ser un número mayor o igual a 0');
  }

  if (!codigo || codigo.trim() === '') {
    errores.push('El código es requerido');
  }

  if (errores.length > 0) {
    return res.status(400).json({ 
      error: 'Datos inválidos', 
      detalles: errores 
    });
  }

  next();
};
