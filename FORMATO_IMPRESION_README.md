# Implementación de Formato Oficial de Solicitud con Impresión

## ✅ Cambios Completados

### 1. Backend
- ✅ Agregado campo `justificacion` al modelo de Solicitudes
- ✅ Migración SQL creada: `007_add_justificacion_to_solicitudes.sql`
- ✅ Servicio actualizado para manejar justificación
- ✅ Controlador actualizado para recibir justificación

### 2. Frontend
- ✅ Formulario de nueva solicitud actualizado con campo de justificación (requerido)
- ✅ Componente `SolicitudPrintView.jsx` creado con formato oficial
- ✅ CSS de impresión `SolicitudPrint.css` creado
- ✅ Botón "Ver/Imprimir" agregado a:
  - MisSolicitudesPage (solicitantes)
  - SolicitudesPendientesPage (encargados)
  - SolicitudesAprobadasPage (encargados)

## 📋 Características del Formato Oficial

1. **Fecha formateada** en español (ej: "Martes 19 de mayo de 2026")
2. **DE:** Nombre del solicitante - Username
3. **A DIRECCIÓN DE SUMINISTRO:** Con justificación personalizable
4. **Tabla con 40 filas fijas** (ITEM, CANT., DESCRIPCION)
5. **Contador de cantidades totales** debajo de la tabla
6. **Botón de impresión** que usa window.print()

## 🔧 Instrucciones de Instalación

### 1. Ejecutar migración SQL
Ejecuta el siguiente comando en tu base de datos MySQL:

```sql
ALTER TABLE solicitudes 
ADD COLUMN justificacion TEXT NULL 
COMMENT 'Justificación formal para el documento de solicitud' 
AFTER observaciones;
```

O ejecuta el archivo:
```
server/migrations/007_add_justificacion_to_solicitudes.sql
```

### 2. Reiniciar el servidor backend
```bash
cd server
npm start
```

### 3. El frontend no necesita reinstalar dependencias
El frontend ya está actualizado y funcionando.

## 📝 Uso

### Solicitantes:
1. Al crear una solicitud, llenar el campo **"Justificación"** (obligatorio)
   - Ejemplo: "EJECUCION DE OBRAS DE REPARACION Y MANTENIMIENTO"
2. Agregar artículos (hasta 40 máximo)
3. Después de crear, usar botón **"Ver/Imprimir"** en cualquier solicitud
4. El formato oficial se abre en un modal
5. Presionar **"Imprimir"** para imprimir el documento

### Encargados:
- Pueden ver e imprimir cualquier solicitud usando el mismo botón
- Disponible en "Pendientes", "Aprobadas" y desde cualquier lista

## ⚠️ Notas Importantes

- El límite de 40 artículos por solicitud ahora es **visual en el documento**
- El contador de cantidades suma **todas las cantidades solicitadas**
- El documento se optimiza automáticamente para impresión (tamaño carta)
- Las filas vacías se muestran en blanco para cumplir con el formato oficial
