import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { connectDB } from '../config/connection.js';
import router from '../routers/index.route.js';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
config();

const app = express();
const PORT = process.env.PORT || 3434;


// Middlewares
app.use(helmet());
app.use(cors(
    {
        origin: 'http://localhost:5173',
    }
));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use(router);

// --- Static frontend (Vite build) ---
// Detectar carpeta dist del frontend (../public/dist respecto a este archivo)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../../../public/dist');

if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    // Fallback para rutas del SPA (después de las rutas API)
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendDist, 'index.html'));
    });
    console.log('[STATIC] Sirviendo frontend desde:', frontendDist);
} else {
    console.warn('[STATIC] Carpeta dist no encontrada. Ejecuta "npm run build" dentro de /public para producirla.');
}

// Start server
export const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};