-- =====================================================
-- Migración 003: Crear tabla solicitud_items
-- Descripción: Detalle de artículos por solicitud
-- Fecha: 2026-05-06
-- IMPORTANTE: Ejecutar después de 002_crear_tabla_solicitudes.sql
-- =====================================================

-- Crear tabla solicitud_items
CREATE TABLE IF NOT EXISTS solicitud_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  solicitudId INT NOT NULL COMMENT 'Solicitud padre',
  inventarioId INT NOT NULL COMMENT 'Artículo solicitado',
  articulo VARCHAR(255) NOT NULL,
  codigo VARCHAR(255) NOT NULL,
  cantidad_solicitada INT NOT NULL COMMENT 'Cantidad que pide el solicitante',
  cantidad_aprobada INT DEFAULT 0 COMMENT 'Cantidad que aprueba el encargado (puede ser menor)',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_item_solicitud 
    FOREIGN KEY (solicitudId) REFERENCES solicitudes(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_inventario 
    FOREIGN KEY (inventarioId) REFERENCES inventario(id) ON DELETE RESTRICT,
  
  INDEX idx_solicitud (solicitudId),
  INDEX idx_inventario (inventarioId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar creación
SELECT 'Tabla solicitud_items creada exitosamente' AS mensaje;
SELECT COUNT(*) AS total_items FROM solicitud_items;
