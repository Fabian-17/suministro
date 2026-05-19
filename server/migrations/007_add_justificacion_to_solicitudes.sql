-- Agregar campo justificacion a la tabla solicitudes
-- Fecha: 2026-05-19
-- Descripción: Campo para almacenar la justificación formal del documento de solicitud

ALTER TABLE solicitudes 
ADD COLUMN justificacion TEXT NULL 
COMMENT 'Justificación formal para el documento de solicitud (ej: EJECUCION DE OBRAS DE REPARACION Y MANTENIMIENTO)' 
AFTER observaciones;
