import { Sequelize } from 'sequelize';
import fileDirName from '../utils/FileDirName.js';
import dotenv from 'dotenv';
import fs from "fs";
import path from "path";

dotenv.config();

const { __dirname } = fileDirName(import.meta);

const logsDir = path.join(__dirname, 'logs');
const logFile = path.join(logsDir, 'database.log');

// Crea el directorio 'logs' si no existe
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true }); 
  }
  
  // Crea el archivo 'database.log' si no existe
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '', 'utf-8');
  }
  
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: (msg) => logStream.write(`${msg}\n`),
        pool: {
            max: 15,          // Máximo 15 conexiones simultáneas
            min: 0,           // No crear conexiones al inicio
            acquire: 30000,   // Tiempo máximo para adquirir conexión: 30 segundos
            idle: 10000,      // Tiempo antes de liberar conexión inactiva: 10 segundos
        },
        dialectOptions: {
            connectTimeout: 10000  // Timeout de conexión inicial: 10 segundos
        }
    }
)