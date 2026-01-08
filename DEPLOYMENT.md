# 🚀 Guía de Despliegue en Producción

## Opciones de Hosting

### Para el Backend (Node.js + Express)
- **Railway** - Fácil y gratuito para comenzar
- **Render** - Plan gratuito disponible
- **Heroku** - Clásico pero de pago
- **DigitalOcean** - VPS con más control
- **AWS EC2** - Escalable pero más complejo

### Para el Frontend (React)
- **Vercel** - Ideal para React, muy fácil
- **Netlify** - Similar a Vercel
- **GitHub Pages** - Gratuito pero limitado
- **Render** - También soporta frontend estático
- **Railway** - Puede alojar ambos

### Para la Base de Datos (MySQL)
- **PlanetScale** - MySQL serverless gratuito
- **Railway** - Incluye base de datos
- **AWS RDS** - Robusto pero de pago
- **DigitalOcean Managed Databases**

---

## 📦 Despliegue Recomendado: Railway (Todo en uno)

### 1. Preparar el Proyecto

#### Backend
Crear `railway.json` en la carpeta `server/`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### Frontend
Actualizar `package.json` en `public/`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite preview --port 5173 --host"
  }
}
```

### 2. Subir a Railway

1. Crear cuenta en https://railway.app
2. Crear nuevo proyecto
3. Agregar servicio MySQL
4. Agregar servicio para Backend (conectar desde GitHub o CLI)
5. Agregar servicio para Frontend

### 3. Configurar Variables de Entorno

#### Backend en Railway:
```env
DB_HOST=<mysql_host_de_railway>
DB_PORT=3306
DB_USER=<usuario_mysql>
DB_PASS=<password_mysql>
DB_NAME=suministro
PORT=3434
NODE_ENV=production
```

#### Frontend en Railway:
```env
VITE_API_URL=<url_del_backend_railway>
```

### 4. CORS en Backend

Actualizar `server/src/server/server.js`:
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
```

Y agregar en Railway:
```env
FRONTEND_URL=<url_del_frontend_railway>
```

---

## 🌍 Despliegue Alternativo: Vercel (Frontend) + Render (Backend)

### Frontend en Vercel

1. Push tu código a GitHub
2. Conectar repositorio en https://vercel.com
3. Configurar:
   - **Framework Preset**: Vite
   - **Root Directory**: `public`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Variables de entorno:
   ```
   VITE_API_URL=<url_de_render>
   ```

### Backend en Render

1. Crear cuenta en https://render.com
2. Crear nuevo "Web Service"
3. Conectar repositorio
4. Configurar:
   - **Environment**: Node
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Variables de entorno (igual que Railway)

### Base de Datos en PlanetScale

1. Crear cuenta en https://planetscale.com
2. Crear nueva database
3. Obtener connection string
4. Actualizar variables de entorno del backend

---

## 🔧 Configuración Avanzada

### Nginx como Reverse Proxy (VPS)

Si despliegas en un VPS propio:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        root /var/www/suministros/public/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3434/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 para mantener el Backend activo

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
cd server
pm2 start index.js --name "suministros-api"

# Ver logs
pm2 logs suministros-api

# Reiniciar al reboot
pm2 startup
pm2 save
```

### Docker Compose (Opcional)

Crear `docker-compose.yml` en la raíz:
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASS}
      MYSQL_DATABASE: suministro
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./server
    ports:
      - "3434:3434"
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASS: ${DB_PASS}
      DB_NAME: suministro
    depends_on:
      - mysql

  frontend:
    build: ./public
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3434

volumes:
  mysql_data:
```

---

## ✅ Checklist Pre-Despliegue

- [ ] Cambiar todas las URLs hardcodeadas a variables de entorno
- [ ] Configurar CORS correctamente
- [ ] Crear archivos `.env.example` con todas las variables necesarias
- [ ] Probar build de producción localmente
- [ ] Configurar base de datos en producción
- [ ] Importar schema SQL inicial
- [ ] Configurar backup automático de la base de datos
- [ ] Configurar SSL/HTTPS (Let's Encrypt gratuito)
- [ ] Probar todos los endpoints de la API
- [ ] Verificar que los reportes PDF se generen correctamente
- [ ] Configurar logs y monitoreo
- [ ] Documentar credenciales de producción de forma segura

---

## 🔐 Seguridad en Producción

### Recomendaciones:

1. **Nunca commitear archivos `.env`** al repositorio
2. **Usar secrets management** en la plataforma de hosting
3. **Implementar rate limiting** en el backend
4. **Agregar autenticación JWT** para proteger endpoints
5. **Usar HTTPS** siempre en producción
6. **Validar y sanitizar** todas las entradas del usuario
7. **Mantener dependencias actualizadas**: `npm audit fix`
8. **Configurar backup automático** de la base de datos
9. **Implementar logs** para debugging: Winston o Morgan
10. **Monitoreo**: Usar servicios como Sentry o LogRocket

---

## 📞 Soporte

Si tienes problemas con el despliegue, verifica:

1. Los logs del servidor
2. Las variables de entorno
3. La conexión a la base de datos
4. Las reglas de firewall
5. La configuración de CORS

Para más ayuda, consulta la documentación de tu plataforma de hosting.
