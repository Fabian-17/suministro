# � Sistema de Gestión de Suministros con Autenticación Multi-Usuario

Sistema completo de gestión de inventario, entradas, salidas y **solicitudes con aprobación** para administración municipal. Incluye autenticación JWT, roles (admin, encargado, solicitante) y **notificaciones en tiempo real** con Socket.io.

---

## ✨ Características Principales

### **Sistema Base (Existente)**
- ✅ Gestión de inventario (414 artículos)
- ✅ Control de entradas
- ✅ Control de salidas
- ✅ Gestión de encargados y áreas
- ✅ Notas de pedido semanal
- ✅ Exportación a Excel

### **Nuevas Funcionalidades (Fases 1, 2 y 3)**

#### **🔐 Autenticación y Usuarios**
- ✅ Login con JWT (tokens en sessionStorage)
- ✅ 3 roles: Admin, Encargado Suministro, Solicitante
- ✅ Gestión completa de usuarios (CRUD)
- ✅ Protección de rutas por rol
- ✅ Activar/Desactivar usuarios

#### **📦 Sistema de Solicitudes**
- ✅ Crear solicitudes con validación de stock
- ✅ Aprobar solicitudes (total o parcialmente)
- ✅ Rechazar solicitudes con motivo
- ✅ Procesar solicitudes → **Genera salidas automáticamente**
- ✅ Estados: Pendiente → Aprobada → Procesada
- ✅ Vincular solicitudes con salidas

#### **🔔 Notificaciones en Tiempo Real**
- ✅ Socket.io con autenticación JWT
- ✅ Notificaciones instantáneas
- ✅ Persistencia en base de datos
- ✅ Badge con contador
- ✅ Panel dropdown elegante
- ✅ Notificaciones del navegador

---

## 🛠 Tecnologías

### **Backend**
- Node.js + Express 5.1.0
- MySQL 10.4.32 (MariaDB)
- Sequelize 6.37.7 (ORM)
- JWT (jsonwebtoken 9.0.3)
- bcryptjs 3.0.3
- Socket.io 4.8.3 (WebSocket)
- Helmet, CORS, express-validator

### **Frontend**
- React 19.1.0
- React Router DOM 7.8.2
- Vite 7.0.4
- Socket.io Client 4.8.3
- CSS modules

---

## 📦 Requisitos Previos

- Node.js 18+ y npm
- MySQL/MariaDB 10.4+
- Git (opcional)

---

## 🚀 Instalación

### **1. Clonar/Descargar el proyecto**
```bash
cd C:\Users\Usuario\Desktop\suministro
```

### **2. Instalar dependencias del BACKEND**
```bash
cd server
npm install
```

### **3. Instalar dependencias del FRONTEND**
```bash
cd ..\public
npm install
```

---

## ⚙ Configuración

### **Paso 1: Base de Datos**

#### **Ejecutar migraciones SQL (EN ORDEN):**

Acceder a MySQL y ejecutar manualmente:
```bash
cd server/migrations
```

1. `001_crear_tabla_usuarios.sql` → Tabla de usuarios con roles
2. `002_crear_tabla_solicitudes.sql` → Tabla de solicitudes
3. `003_crear_tabla_solicitud_items.sql` → Items de solicitudes
4. `004_modificar_tabla_salida.sql` → Añade FK a salidas
5. `005_crear_tabla_notificaciones.sql` → Notificaciones
6. `006_crear_usuario_admin_inicial.sql` → Usuario admin por defecto

### **Paso 2: Variables de Entorno**

#### **Backend** (`server/.env`):
```env
# Base de datos
DB_HOST=localhost
DB_NAME=suministro_db
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=mi_secreto_super_seguro_cambiar_en_produccion_2026

# Frontend
FRONTEND_URL=http://localhost:5173
```

#### **Frontend** (`public/.env` - Opcional):
```env
VITE_API_URL=http://localhost:3434
```

---

## ▶ Ejecución

### **Terminal 1: Backend**
```bash
cd server
npm start
```

### **Terminal 2: Frontend**
```bash
cd public
npm run dev
```

**Abrirá en:** http://localhost:5173

---

## 👥 Usuarios por Defecto

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| **admin** | admin123 | Admin |

**Crear más usuarios:**
1. Login como admin
2. Ir a **Usuarios** → **+ Nuevo Usuario**

---

## 📂 Estructura del Proyecto

```
suministro/
├── server/                    # Backend Node.js
│   ├── migrations/            # ⭐ Migraciones SQL
│   ├── src/
│   │   ├── config/           # DB, Socket.io
│   │   ├── controllers/      # Lógica de endpoints
│   │   ├── middlewares/      # Auth JWT
│   │   ├── models/           # Sequelize models
│   │   ├── routers/          # Rutas Express
│   │   ├── services/         # Lógica de negocio
│   │   └── server/           # Servidor
│   └── .env
│
├── public/                   # Frontend React
│   ├── src/
│   │   ├── context/         # Auth, Socket
│   │   ├── components/      # Navbar, Notificaciones
│   │   ├── pages/           # Login, Solicitudes, Usuarios
│   │   ├── routes/          # AppRoutes
│   │   └── styles/          # CSS
│   └── .env
│
├── FASE_1_COMPLETADA.md     # 📄 Docs Fase 1
├── FASE_2_COMPLETADA.md     # 📄 Docs Fase 2
├── FASE_3_COMPLETADA.md     # 📄 Docs Fase 3
└── README.md                # 📄 Este archivo
```

---

## 🔄 Flujos de Trabajo

### **Flujo 1: Solicitante crea solicitud**
```
Login → Nueva Solicitud → Buscar productos → Agregar cantidades → Enviar
→ Encargados reciben notificación 🔔
```

### **Flujo 2: Encargado aprueba**
```
Notificación 🔔 → Solicitudes Pendientes → Aprobar → Modificar cantidades
→ Solicitante recibe notificación ⚡
```

### **Flujo 3: Encargado procesa**
```
Solicitudes Aprobadas → Procesar → Seleccionar fecha
→ Genera salidas automáticamente
→ Actualiza inventario
→ Solicitante recibe notificación ⚡
```

---

## 🔌 API Endpoints

### **Autenticación** (`/auth`)
- `POST /auth/login` - Login
- `GET /auth/me` - Verificar token
- `PUT /auth/cambiar-password` - Cambiar contraseña

### **Usuarios** (`/usuarios`) - Admin
- `GET /usuarios` - Listar
- `POST /usuarios` - Crear
- `PUT /usuarios/:id` - Actualizar
- `DELETE /usuarios/:id` - Desactivar

### **Solicitudes** (`/solicitudes`)
- `POST /solicitudes` - Crear
- `GET /solicitudes/mis-solicitudes` - Ver propias
- `GET /solicitudes/pendientes` - Ver pendientes (Encargado)
- `PUT /solicitudes/:id/aprobar` - Aprobar (Encargado)
- `POST /solicitudes/:id/procesar` - Procesar (Encargado)

### **Notificaciones** (`/notificaciones`)
- `GET /notificaciones/no-leidas` - Ver no leídas
- `GET /notificaciones/contador` - Contador
- `PUT /notificaciones/:id/leer` - Marcar leída

Ver **`api-tests-fase1.http`** y **`api-tests-fase2.http`** para ejemplos.

---

## 📱 Eventos Socket.io

### **Servidor → Cliente**
- `solicitud:nueva` - Nueva solicitud (a encargados)
- `solicitud:aprobada` - Aprobada (a solicitante)
- `solicitud:rechazada` - Rechazada (a solicitante)
- `solicitud:procesada` - Procesada (a solicitante)
- `notificacion:nueva` - Nueva notificación

---

## 📚 Documentación Completa

- **[FASE_1_COMPLETADA.md](./server/FASE_1_COMPLETADA.md)** - Backend: Auth y Usuarios
- **[FASE_2_COMPLETADA.md](./server/FASE_2_COMPLETADA.md)** - Backend: Solicitudes y Notificaciones
- **[FASE_3_COMPLETADA.md](./FASE_3_COMPLETADA.md)** - Frontend: React UI

---

## 🐛 Solución de Problemas

### **Backend no arranca**
```bash
netstat -ano | findstr :3434  # Verificar puerto
mysql -u root -p             # Verificar MySQL
```

### **Socket.io no conecta**
1. Verificar backend corriendo
2. Abrir consola navegador (F12)
3. Verificar CORS en `server.js`

### **Token inválido**
1. Cerrar sesión
2. Limpiar sessionStorage (F12)
3. Volver a iniciar sesión

---

## 🎉 ¡Sistema Completo!

✅ Autenticación multi-usuario  
✅ Sistema de solicitudes  
✅ Notificaciones en tiempo real  
✅ Generación automática de salidas  
✅ UI moderna y responsive  

**¡Listo para producción!** 🚀

- [ ] Autenticación de usuarios
- [ ] Historial de cambios
- [ ] Dashboard con gráficos
- [ ] Notificaciones de stock bajo
- [ ] Exportar a Excel
- [ ] Búsqueda avanzada y filtros
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)

## 👥 Autores

Desarrollado para gestión interna de suministros.
