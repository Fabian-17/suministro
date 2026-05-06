-- =====================================================
-- Migración 006: Crear usuario administrador inicial
-- Descripción: Usuario admin para empezar a usar el sistema
-- Fecha: 2026-05-06
-- IMPORTANTE: Ejecutar después de 001_crear_tabla_usuarios.sql
-- =====================================================

-- NOTA: Primero genera el hash de la contraseña usando bcrypt
-- 
-- Para generar el hash, ejecuta en Node.js:
-- node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"
-- 
-- O usa este comando en la terminal del servidor:
-- cd server
-- node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"

-- PASO 1: Reemplaza el hash en la siguiente línea con el generado
-- Hash de ejemplo (NO USAR EN PRODUCCIÓN): $2a$10$CwTycUXWue0Thq9StjUM0uJ8k9pJ.YD3WIW.9RpQfHpZD6KQRrJhW
-- Esta es la contraseña: admin123

INSERT INTO usuarios (username, password, rol, activo) 
VALUES (
  'admin',
  '$2b$10$rQ7cMd87BVbnu35t3mv2iO1VgsAkwhC8bbxPl2qDTYjaTl9yJJApK',
  'admin',
  TRUE
) ON DUPLICATE KEY UPDATE password = VALUES(password);

-- Verificar creación
SELECT 'Usuario admin creado exitosamente' AS mensaje;
SELECT id, username, rol, activo, createdAt FROM usuarios WHERE username = 'admin';

-- =====================================================
-- INSTRUCCIONES POST-INSTALACIÓN:
-- =====================================================
-- 1. Inicia sesión con:
--    Usuario: admin
--    Contraseña: admin123
--
-- 2. IMPORTANTE: Cambia la contraseña inmediatamente después del primer login
--
-- 3. Este usuario admin puede crear otros usuarios del sistema
-- =====================================================
