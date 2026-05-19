import { sequelize } from "./configDB.js";
import relaciones from "../models/relaciones.js";


export const connectDB = async () => {
    relaciones();
    
    // Timeout de 30 segundos para la conexión (aumentado para MySQL lento)
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La conexión a la base de datos tardó más de 30 segundos')), 30000);
    });
    
    const connectPromise = sequelize.authenticate();
    
    try {
        await Promise.race([connectPromise, timeoutPromise]);
        console.log("✅ Conexión a la base de datos exitosa");
    } catch (err) {
        console.error("❌ Error al conectar a la base de datos:", err.message);
        console.error("💡 Verifica que MySQL esté corriendo y las credenciales sean correctas");
        console.error("💡 El servidor seguirá funcionando pero las peticiones a la DB fallarán");
        // No hacer exit, permitir que el servidor funcione parcialmente
    }
};
