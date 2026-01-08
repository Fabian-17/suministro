# 📦 Sistema de Gestión de Suministros

Sistema web para gestión de inventario, entradas y salidas de suministros con generación de reportes PDF.

## 🚀 Características

- ✅ Gestión de inventario de artículos
- ✅ Registro de entradas de mercancía
- ✅ Registro de salidas con destinatario y área
- ✅ Generación de reportes PDF agrupados por área y destinatario
- ✅ Gestión de encargados por área
- ✅ Interfaz responsive y moderna

## 🛠️ Tecnologías

### Frontend
- React 19
- React Router DOM
- Vite
- jsPDF (generación de PDFs)

### Backend
- Node.js
- Express 5
- Sequelize ORM
- MySQL
- Helmet (seguridad)
- CORS

## 📋 Requisitos Previos

- Node.js >= 18
- MySQL >= 8.0
- npm o yarn

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd suministro
```

### 2. Configurar Base de Datos
```bash
# Importar el schema
mysql -u root -p < suministro.sql
```

### 3. Configurar Backend
```bash
cd server
npm install

# Crear archivo .env
cp .env.example .env
# Editar .env con tus credenciales de MySQL
```

### 4. Configurar Frontend
```bash
cd ../public
npm install

# Crear archivo .env
cp .env.example .env
# Editar .env con la URL de tu API
```

**Archivo `.env` para desarrollo local:**
```env
VITE_API_URL=http://localhost:3434
```

**Archivo `.env` para producción:**
```env
VITE_API_URL=https://tu-dominio.com/api
```

## 🚀 Ejecución

### Desarrollo Local

#### Backend
```bash
cd server
npm run dev  # Modo desarrollo con nodemon
```
El servidor estará disponible en `http://localhost:3434`

#### Frontend
```bash
cd public
npm run dev  # Modo desarrollo
```
La aplicación estará disponible en `http://localhost:5173`

### Producción

#### Backend
```bash
cd server
npm start
```

#### Frontend
```bash
cd public
npm run build
npm run preview
```

### 🌐 Despliegue en Línea

Para desplegar la aplicación en un servidor:

1. **Backend**: 
   - Actualiza el archivo `.env` con las credenciales de producción
   - Cambia `NODE_ENV=production`
   - Actualiza el `origin` en CORS a la URL de tu frontend en producción
   
2. **Frontend**:
   - Actualiza `VITE_API_URL` en `.env` con la URL de tu API en producción
   - Genera el build: `npm run build`
   - Despliega la carpeta `dist/` en tu servidor web

3. **Base de Datos**:
   - Asegúrate de que tu base de datos MySQL esté accesible desde el servidor
   - Configura las reglas de firewall adecuadas

## 📁 Estructura del Proyecto

```
suministro/
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/        # Configuración DB
│   │   ├── controllers/   # Controladores
│   │   ├── models/        # Modelos Sequelize
│   │   ├── routes/        # Rutas API
│   │   ├── services/      # Lógica de negocio
│   │   └── server/        # Configuración servidor
│   └── index.js
│
├── public/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── context/       # Context API
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Páginas/Vistas
│   │   ├── routes/        # Configuración rutas
│   │   └── styles/        # Estilos globales
│   └── index.html
│
└── suministro.sql         # Schema de base de datos
```

## 🐛 Problemas Conocidos y Soluciones

### Error: "grupos[area][destinatario].map is not a function"
✅ **Solucionado**: Se corrigió la estructura de agrupación en reportes.

## 📝 API Endpoints

### Inventario
- `GET /inventarios` - Obtener todo el inventario
- `POST /inventarios` - Crear artículo
- `PUT /inventarios/:id` - Actualizar artículo

### Entradas
- `GET /entradas` - Obtener todas las entradas
- `POST /entradas` - Registrar entrada

### Salidas
- `GET /salidas` - Obtener todas las salidas
- `POST /salidas` - Registrar salida
- `PUT /salidas/:id` - Actualizar salida

### Áreas
- `GET /areas` - Obtener áreas
- `POST /areas` - Crear área

### Encargados
- `GET /encargados` - Obtener encargados
- `POST /encargados` - Crear encargado

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de uso interno.

## ✨ Mejoras Futuras

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
