-- =====================================================
-- Migración 001: Crear tabla usuarios
-- Descripción: Tabla para autenticación y gestión de usuarios del sistema
-- Fecha: 2026-05-06
-- IMPORTANTE: Ejecutar manualmente desde MySQL antes de usar el sistema
-- =====================================================

-- Crear tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
  rol ENUM('admin', 'encargado_suministro', 'solicitante') NOT NULL,
  encargadoId INT DEFAULT NULL COMMENT 'FK a encargados - solo para solicitantes',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Para activar/desactivar usuarios',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_usuario_encargado 
    FOREIGN KEY (encargadoId) REFERENCES encargados(id) ON DELETE SET NULL,
  
  INDEX idx_username (username),
  INDEX idx_rol (rol),
  INDEX idx_encargado (encargadoId),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar creación
SELECT 'Tabla usuarios creada exitosamente' AS mensaje;
SELECT COUNT(*) AS total_usuarios FROM usuarios;
