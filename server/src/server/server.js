import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { connectDB } from '../config/connection.js';
import { initializeSocket } from '../config/socket.js';
import router from '../routers/index.route.js';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3434;


// Middlewares
app.use(helmet());

// CORS configurado para desarrollo y producción
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps o curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (para keep-alive)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes API
app.use(router);


// Start server
export const startServer = async () => {
    try {
        // Iniciar servidor HTTP primero (para que responda inmediatamente)
        httpServer.listen(PORT, () => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
            console.log(`📡 API disponible en: http://localhost:${PORT}`);
            console.log('⏳ Conectando a la base de datos...');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });

        // Conectar a la base de datos (en segundo plano)
        await connectDB();
        
        // Inicializar Socket.io después de conectar DB
        const io = initializeSocket(httpServer);
        
        // Guardar instancia de io en app para usar en controladores
        app.set('io', io);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🔌 Socket.io inicializado correctamente`);
        console.log(`🌐 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
        console.log('✅ Sistema completamente operativo');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};