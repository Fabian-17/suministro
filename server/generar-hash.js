/**
 * Script para generar hash bcrypt de contraseña
 * Uso: node generar-hash.js [contraseña]
 * 
 * Ejemplo: node generar-hash.js admin123
 */

import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
    console.log('\n❌ Error: Proporciona una contraseña');
    console.log('\nUso: node generar-hash.js [contraseña]');
    console.log('Ejemplo: node generar-hash.js admin123\n');
    process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

console.log('\n✅ Hash generado exitosamente:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Contraseña: ${password}`);
console.log(`Hash:       ${hash}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Copia este hash y úsalo en el archivo 006_crear_usuario_admin_inicial.sql\n');
