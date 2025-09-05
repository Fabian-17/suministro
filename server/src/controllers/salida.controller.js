import { crearSalida,
    actualizarSalida,
    obtenerSalidaPorArticulo,
    obtenerSalidaPorFecha,
    obtenerSalidas
 } from "../services/salida.service.js";
import { Salida } from "../models/salida.js";
 import xlsx from "xlsx";


export const crearSalidaController = async (req, res) => {
    try {
        const { articulo, cantidad, codigo, area, destinatario, fecha } = req.body;
        if (!articulo || !cantidad || !codigo || !area || !destinatario || !fecha) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }
        const nuevaSalida = await crearSalida({ articulo, cantidad, codigo, area, destinatario, fecha });
        res.status(201).json(nuevaSalida);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const actualizarSalidaController = async (req, res) => {
    try {
        const { id } = req.params;
        const { articulo, cantidad, codigo, area, destinatario } = req.body;
        if (!articulo || !cantidad || !codigo || !area || !destinatario) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }
        const salidaActualizada = await actualizarSalida(id, { articulo, cantidad, codigo, area, destinatario });
        res.status(200).json(salidaActualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const obtenerSalidaPorArticuloController = async (req, res) => {
    try {
        const { articulo } = req.params;
        const salida = await obtenerSalidaPorArticulo(articulo);
        if (!salida) {
            return res.status(404).json({ error: "Salida no encontrada" });
        }
        res.status(200).json(salida);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const obtenerSalidaPorFechaController = async (req, res) => {
    try {
        const { fecha } = req.params;
        const salida = await obtenerSalidaPorFecha(fecha);
        if (!salida) {
            return res.status(404).json({ error: "Salida no encontrada" });
        }
        res.status(200).json(salida);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const obtenerSalidasController = async (req, res) => {
    try {
        const salidas = await obtenerSalidas();
        if (!salidas || salidas.length === 0) {
            return res.status(404).json({ error: "No se encontraron salidas" });
        }
        res.status(200).json(salidas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const uploadExcelSalidasController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames.find(name => name.toUpperCase() === "DATOS");
        if (!sheetName) {
            return res.status(400).json({ error: "El archivo no contiene la hoja DATOS" });
        }

        const sheet = workbook.Sheets[sheetName];
        // Convertir la hoja a array de arrays
        const raw = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        // Buscar la fila de títulos
        let headerRowIdx = raw.findIndex(row =>
            row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('fecha')) &&
            row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('area')) &&
            row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('destino')) &&
            row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('articulo')) &&
            row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('canti'))
        );
        if (headerRowIdx === -1) {
            return res.status(400).json({ error: 'No se encontró la fila de títulos esperada.' });
        }
        const headers = raw[headerRowIdx];
        // Mapear los índices de los campos
        const idxFecha = headers.findIndex(h => h && h.toString().toLowerCase().includes('fecha'));
        const idxArea = headers.findIndex(h => h && h.toString().toLowerCase().includes('area'));
        const idxDestino = headers.findIndex(h => h && h.toString().toLowerCase().includes('destino'));
        const idxArticulo = headers.findIndex(h => h && h.toString().toLowerCase().includes('articulo'));
        const idxCantidad = headers.findIndex(h => h && h.toString().toLowerCase().includes('canti'));

        let count = 0;
        for (let i = headerRowIdx + 1; i < raw.length; i++) {
            const row = raw[i];
                let fecha = row[idxFecha];
                const area = row[idxDestino];
                const destinatario = row[idxArea];
                const articulo = row[idxArticulo];
                let cantidad = row[idxCantidad];
                // Normalizar cantidad (puede venir como string tipo "4 mts")
                if (typeof cantidad === "string") {
                    const match = cantidad.match(/\d+/);
                    cantidad = match ? parseInt(match[0], 10) : 0;
                }
                // Convertir fecha dd/mm/yyyy a ISO
                if (typeof fecha === "string" && fecha.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                    const [d, m, y] = fecha.split("/");
                    fecha = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
                } else if (typeof fecha === "number" && !isNaN(fecha)) {
                    // Excel serial date: days since 1899-12-30, leap year bug
                    let days = fecha;
                    if (days >= 60) days--;
                    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                    const dateObj = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
                    fecha = dateObj.toISOString().slice(0, 10);
                }

                // Relajar condición: solo requiere articulo, cantidad y fecha
                if (!articulo || !cantidad || !fecha) continue;
                await Salida.create({
                    articulo,
                    cantidad,
                    fecha,
                    area: area || "",
                    destinatario: destinatario || "",
                    codigo: "SIN-CODIGO",
                    inventarioId: null
                });
                count++;
        }

        res.json({ message: "Archivo de salidas procesado correctamente", count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};