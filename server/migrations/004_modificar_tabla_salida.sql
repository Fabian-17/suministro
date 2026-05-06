-- =====================================================
-- Migración 004: Modificar tabla salida
-- Descripción: Agregar columnas para vincular con solicitudes y usuarios
-- Fecha: 2026-05-06
-- IMPORTANTE: Ejecutar después de 002_crear_tabla_solicitudes.sql
-- NOTA: Esta modificación NO afecta datos existentes
-- =====================================================

-- Agregar columnas nuevas (solo si no existen)
ALTER TABLE salida 
ADD COLUMN IF NOT EXISTS solicitudId INT DEFAULT NULL COMMENT 'NULL = salida manual, ID = salida automática',
ADD COLUMN IF NOT EXISTS usuarioId INT DEFAULT NULL COMMENT 'Usuario que registró la salida';

-- Agregar foreign keys (verificar primero que no existan)
-- Para MySQL/MariaDB, usamos procedure temporal para evitar errores si ya existe

DELIMITER $$

CREATE PROCEDURE add_salida_constraints()
BEGIN
  -- Verificar si existe la FK antes de agregarla
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'salida' 
    AND CONSTRAINT_NAME = 'fk_salida_solicitud'
  ) THEN
    ALTER TABLE salida 
    ADD CONSTRAINT fk_salida_solicitud 
      FOREIGN KEY (solicitudId) REFERENCES solicitudes(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'salida' 
    AND CONSTRAINT_NAME = 'fk_salida_usuario'
  ) THEN
    ALTER TABLE salida 
    ADD CONSTRAINT fk_salida_usuario 
      FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE SET NULL;
  END IF;
END$$

DELIMITER ;

-- Ejecutar el procedure
CALL add_salida_constraints();

-- Eliminar el procedure temporal
DROP PROCEDURE IF EXISTS add_salida_constraints;

-- Agregar índices
CREATE INDEX IF NOT EXISTS idx_salida_solicitud ON salida(solicitudId);
CREATE INDEX IF NOT EXISTS idx_salida_usuario ON salida(usuarioId);

-- Verificar modificación
SELECT 'Tabla salida modificada exitosamente' AS mensaje;
DESCRIBE salida;
