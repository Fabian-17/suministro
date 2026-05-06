-- =====================================================
-- Migración 005: Crear tabla notificaciones
-- Descripción: Sistema de notificaciones en tiempo real
-- Fecha: 2026-05-06
-- IMPORTANTE: Ejecutar después de 002_crear_tabla_solicitudes.sql
-- =====================================================

-- Crear tabla notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuarioId INT NOT NULL COMMENT 'Usuario que recibe la notificación',
  tipo ENUM(
    'solicitud_nueva',
    'solicitud_aprobada', 
    'solicitud_rechazada',
    'solicitud_procesada'
  ) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT COMMENT 'Contenido de la notificación',
  solicitudId INT DEFAULT NULL COMMENT 'Referencia a solicitud relacionada',
  leida BOOLEAN DEFAULT FALSE COMMENT 'Estado de lectura',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_notificacion_usuario 
    FOREIGN KEY (usuarioId) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_notificacion_solicitud 
    FOREIGN KEY (solicitudId) REFERENCES solicitudes(id) ON DELETE CASCADE,
  
  INDEX idx_usuario (usuarioId),
  INDEX idx_leida (leida),
  INDEX idx_fecha (createdAt),
  INDEX idx_usuario_leida (usuarioId, leida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar creación
SELECT 'Tabla notificaciones creada exitosamente' AS mensaje;
SELECT COUNT(*) AS total_notificaciones FROM notificaciones;
