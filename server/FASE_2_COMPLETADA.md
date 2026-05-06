# 🚀 Fase 2 Completada: Sistema de Solicitudes y Notificaciones en Tiempo Real

## ✅ Lo que se ha implementado

### 1. **Servicios**
- ✅ `notificacion.service.js` - Gestión de notificaciones
  - Crear notificaciones
  - Notificar eventos (nueva solicitud, aprobada, rechazada, procesada)
  - Obtener notificaciones (leídas/no leídas)
  - Marcar como leídas
  - Contador de notificaciones
  
- ✅ `solicitudes.service.js` - Lógica completa de solicitudes
  - Crear solicitud con validación de stock
  - Obtener solicitudes (todas, propias, pendientes, aprobadas)
  - Aprobar solicitud (total o parcialmente)
  - Rechazar solicitud con motivo
  - Procesar solicitud (generación automática de salidas)
  - Eliminar solicitudes pendientes

### 2. **Controladores**
- ✅ `solicitudes.controller.js` - Endpoints de solicitudes
  - Incluye emisión de eventos Socket.io
  - Validaciones de permisos por rol
  - Manejo de errores específico
  
- ✅ `notificaciones.controller.js` - Endpoints de notificaciones
  - Ver notificaciones no leídas
  - Marcar como leídas
  - Eliminar notificaciones

### 3. **Rutas**
- ✅ `solicitudes.route.js` - Rutas con control de acceso por rol
- ✅ `notificaciones.route.js` - Rutas protegidas

### 4. **Socket.io**
- ✅ `socket.js` - Configuración completa de WebSockets
  - Autenticación de usuarios
  - Rooms por usuario y por rol
  - Funciones helper para emitir eventos
  - CORS configurado

### 5. **Integración**
- ✅ `server.js` - Servidor HTTP con Socket.io integrado
- ✅ `index.route.js` - Rutas nuevas integradas

---

## 📋 Flujo Completo de Solicitudes

### **1. Solicitante crea solicitud**
```
POST /solicitudes
Body: {
  "items": [
    { "inventarioId": 1, "cantidad": 5 },
    { "inventarioId": 2, "cantidad": 3 }
  ],
  "observaciones": "Solicitud urgente"
}

→ Valida stock disponible
→ Crea solicitud con estado "pendiente"
→ Crea items de la solicitud
→ Notifica a encargados y admins (BD + Socket.io)
→ Emite evento: solicitud:nueva
```

### **2. Encargado revisa solicitudes pendientes**
```
GET /solicitudes/pendientes

→ Retorna todas las solicitudes pendientes con items y stock actual
```

### **3. Encargado aprueba solicitud**
```
PUT /solicitudes/:id/aprobar
Body: {
  "items": [
    { "id": 1, "cantidad_aprobada": 5 },
    { "id": 2, "cantidad_aprobada": 2 }  // Puede aprobar menos
  ]
}

→ Valida que cantidad_aprobada ≤ cantidad_solicitada
→ Valida stock disponible
→ Actualiza cantidades aprobadas
→ Cambia estado a "aprobada"
→ Notifica al solicitante (BD + Socket.io)
→ Emite evento: solicitud:aprobada
```

**O rechaza:**
```
PUT /solicitudes/:id/rechazar
Body: {
  "motivo": "Stock insuficiente, solicitar la próxima semana"
}

→ Cambia estado a "rechazada"
→ Guarda motivo
→ Notifica al solicitante
→ Emite evento: solicitud:rechazada
```

### **4. Encargado procesa solicitud aprobada**
```
POST /solicitudes/:id/procesar
Body: {
  "fecha": "2026-05-06"  // Opcional, por defecto hoy
}

→ Valida stock nuevamente
→ Crea salidas automáticamente (una por item)
→ Actualiza inventario (-cantidad, +salida)
→ Vincula salidas con solicitud
→ Cambia estado a "procesada"
→ Notifica al solicitante
→ Emite evento: solicitud:procesada
```

### **5. Solicitante ve el resultado**
```
GET /solicitudes/mis-solicitudes

→ Ve todas sus solicitudes con estados actualizados
→ Recibe notificaciones en tiempo real
```

---

## 📡 Eventos Socket.io

### **Cliente (Frontend) se conecta:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3434', {
  auth: { token }
});

socket.on('connect', () => {
  // Autenticarse
  socket.emit('authenticate', {
    token: 'JWT_TOKEN',
    usuario: {
      id: 1,
      username: 'admin',
      rol: 'admin'
    }
  });
});

socket.on('authenticated', (data) => {
  console.log('Autenticado:', data);
});
```

### **Eventos que puede recibir:**

**Encargados/Admins:**
```javascript
socket.on('solicitud:nueva', (data) => {
  // { solicitudId, solicitante, area, cantidadItems }
  console.log('Nueva solicitud de:', data.solicitante);
  // Mostrar notificación/badge
});
```

**Solicitantes:**
```javascript
socket.on('solicitud:aprobada', (data) => {
  // { solicitudId, mensaje }
  console.log('Solicitud aprobada!');
});

socket.on('solicitud:rechazada', (data) => {
  // { solicitudId, motivo, mensaje }
  console.log('Solicitud rechazada:', data.motivo);
});

socket.on('solicitud:procesada', (data) => {
  // { solicitudId, mensaje }
  console.log('Artículos listos para retirar!');
});
```

**Todos:**
```javascript
socket.on('notificacion:nueva', (data) => {
  // { id, tipo, titulo, mensaje, solicitudId }
  console.log('Nueva notificación:', data.titulo);
});
```

---

## 🔌 Endpoints de Solicitudes

| Método | Endpoint | Auth | Rol | Descripción |
|--------|----------|------|-----|-------------|
| POST | `/solicitudes` | ✅ | Todos | Crear solicitud |
| GET | `/solicitudes/mis-solicitudes` | ✅ | Todos | Mis solicitudes |
| GET | `/solicitudes/pendientes` | ✅ | Encargado/Admin | Pendientes |
| GET | `/solicitudes/aprobadas` | ✅ | Encargado/Admin | Aprobadas |
| GET | `/solicitudes` | ✅ | Encargado/Admin | Todas |
| GET | `/solicitudes/:id` | ✅ | Todos* | Ver detalle |
| PUT | `/solicitudes/:id/aprobar` | ✅ | Encargado/Admin | Aprobar |
| PUT | `/solicitudes/:id/rechazar` | ✅ | Encargado/Admin | Rechazar |
| POST | `/solicitudes/:id/procesar` | ✅ | Encargado/Admin | Procesar |
| DELETE | `/solicitudes/:id` | ✅ | Solicitante/Admin | Eliminar |

*Solicitantes solo ven sus propias solicitudes

---

## 🔔 Endpoints de Notificaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/notificaciones` | Todas mis notificaciones |
| GET | `/notificaciones/no-leidas` | Solo no leídas |
| GET | `/notificaciones/contador` | Contador de no leídas |
| PUT | `/notificaciones/:id/leer` | Marcar una como leída |
| PUT | `/notificaciones/leer-todas` | Marcar todas como leídas |
| DELETE | `/notificaciones/:id` | Eliminar notificación |

---

## 🧪 Pruebas con Ejemplos

### **1. Crear Solicitud (como solicitante)**
```bash
# Login como solicitante
curl -X POST http://localhost:3434/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"solicitante1","password":"123456"}'

# Obtener token y usarlo
TOKEN="eyJhbGc..."

# Crear solicitud
curl -X POST http://localhost:3434/solicitudes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      { "inventarioId": 1, "cantidad": 5 },
      { "inventarioId": 2, "cantidad": 3 }
    ],
    "observaciones": "Necesario para proyecto urgente"
  }'
```

### **2. Ver Solicitudes Pendientes (como encargado)**
```bash
# Login como encargado
curl -X POST http://localhost:3434/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"encargado1","password":"123456"}'

TOKEN="eyJhbGc..."

# Ver pendientes
curl http://localhost:3434/solicitudes/pendientes \
  -H "Authorization: Bearer $TOKEN"
```

### **3. Aprobar Solicitud**
```bash
curl -X PUT http://localhost:3434/solicitudes/1/aprobar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      { "id": 1, "cantidad_aprobada": 5 },
      { "id": 2, "cantidad_aprobada": 2 }
    ]
  }'
```

### **4. Procesar Solicitud (generar salidas)**
```bash
curl -X POST http://localhost:3434/solicitudes/1/procesar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fecha": "2026-05-06"
  }'
```

### **5. Ver Notificaciones**
```bash
# Ver no leídas
curl http://localhost:3434/notificaciones/no-leidas \
  -H "Authorization: Bearer $TOKEN"

# Contador
curl http://localhost:3434/notificaciones/contador \
  -H "Authorization: Bearer $TOKEN"

# Marcar como leída
curl -X PUT http://localhost:3434/notificaciones/1/leer \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔐 Estados de Solicitud

```
pendiente → aprobada → procesada
         ↘ rechazada
```

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| **pendiente** | Recién creada, esperando revisión | Aprobar, Rechazar, Eliminar |
| **aprobada** | Revisada y aprobada | Procesar |
| **rechazada** | No fue aprobada | Ninguna (solo lectura) |
| **procesada** | Salidas generadas | Ninguna (solo lectura) |

---

## 💾 Estructura de Datos

### **Solicitud**
```json
{
  "id": 1,
  "usuarioId": 3,
  "areaId": 5,
  "estado": "pendiente",
  "observaciones": "Urgente",
  "motivo_rechazo": null,
  "fecha_solicitud": "2026-05-06T10:00:00Z",
  "fecha_aprobada": null,
  "fecha_procesada": null,
  "aprobada_por": null,
  "procesada_por": null,
  "usuario": {
    "id": 3,
    "username": "solicitante1",
    "encargado": {
      "id": 1,
      "nombre": "Juan Pérez"
    }
  },
  "area": {
    "id": 5,
    "nombre": "INFORMATICA"
  },
  "items": [
    {
      "id": 1,
      "articulo": "Papel A4",
      "codigo": "PAP-001",
      "cantidad_solicitada": 5,
      "cantidad_aprobada": 0,
      "inventario": {
        "cantidad": 100
      }
    }
  ]
}
```

### **Notificación**
```json
{
  "id": 1,
  "usuarioId": 3,
  "tipo": "solicitud_aprobada",
  "titulo": "✅ Solicitud aprobada",
  "mensaje": "Tu solicitud ha sido aprobada...",
  "solicitudId": 1,
  "leida": false,
  "createdAt": "2026-05-06T10:05:00Z"
}
```

---

## ⚡ Validaciones Implementadas

### **Al Crear Solicitud:**
- ✅ Usuario debe tener encargado vinculado
- ✅ Encargado debe tener al menos un área
- ✅ Items no vacíos
- ✅ Stock disponible para cada artículo

### **Al Aprobar:**
- ✅ Solo solicitudes pendientes
- ✅ Cantidad aprobada ≤ cantidad solicitada
- ✅ Stock disponible al momento de aprobar

### **Al Procesar:**
- ✅ Solo solicitudes aprobadas
- ✅ Stock disponible nuevamente (por si cambió)
- ✅ Transacción atómica (todo o nada)

---

## 🎯 Próxima Fase

**Fase 3: Frontend**
- Páginas de solicitudes
- Componentes de notificaciones
- Integración con Socket.io
- Dashboards por rol

---

## ✅ Checklist de Validación

- [ ] Servidor arranca sin errores
- [ ] Socket.io se inicializa correctamente
- [ ] Crear solicitud funciona
- [ ] Aprobar solicitud funciona
- [ ] Rechazar solicitud funciona
- [ ] Procesar solicitud genera salidas
- [ ] Notificaciones se crean en BD
- [ ] Eventos Socket.io se emiten (probar con cliente)
- [ ] Inventario se actualiza al procesar
- [ ] Permisos por rol funcionan correctamente

¿Todo listo para continuar con la Fase 3 (Frontend)? 🚀
