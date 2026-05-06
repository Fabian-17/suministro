-- =====================================================
-- Migración 002: Crear tabla solicitudes
-- Descripción: Tabla para gestionar solicitudes de artículos
-- Fecha: 2026-05-06
-- IMPORTANTE: Ejecutar después de 001_crear_tabla_usuarios.sql
-- =====================================================

-- Crear tabla solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuarioId INT NOT NULL COMMENT 'Usuario que solicita',
  areaId INT NOT NULL COMMENT 'Área destino de la solicitud',
  estado ENUM('pendiente', 'aprobada', 'rechazada', 'procesada') DEFAULT 'pendiente',
  observaciones TEXT COMMENT 'Observaciones del solicitante',
  motivo_rechazo TEXT COMMENT 'Motivo si fue rechazada',
  
  -- Fechas de auditoría
  fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_aprobada DATETIME DEFAULT NULL,
  fecha_procesada DATETIME DEFAULT NULL,
  
  -- Referencias de quién procesó
  aprobada_por INT DEFAULT NULL COMMENT 'Usuario que aprobó/rechazó',
  procesada_por INT DEFAULT NULL COMMENT 'Usuario que generó las salidas',
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_solicitud_usuario 
    FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_solicitud_area 
    FOREIGN KEY (areaId) REFERENCES areas(id) ON DELETE RESTRICT,
  CONSTRAINT fk_solicitud_aprobador 
    FOREIGN KEY (aprobada_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT fk_solicitud_procesador 
    FOREIGN KEY (procesada_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  
  INDEX idx_usuario (usuarioId),
  INDEX idx_area (areaId),
  INDEX idx_estado (estado),
  INDEX idx_fecha (fecha_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar creación
SELECT 'Tabla solicitudes creada exitosamente' AS mensaje;
SELECT COUNT(*) AS total_solicitudes FROM solicitudes;
