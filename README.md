# Sistema de Gestión de Novedades de Personal — Lujos El Trapiche

Plataforma interna para **registrar, aprobar y consolidar novedades de personal** antes de cada cierre de nómina.

> **Alcance:** el sistema no incluye cuadro de turnos, cuadrantes ni planificación horaria. Se centra exclusivamente en el flujo de novedades y personal activo.

---

## 📁 Repositorios y Estructura

| Carpeta | Descripción |
| --- | --- |
| [`backend-novedades/`](backend-novedades) | API REST en Laravel 12 + Sanctum |
| [`frontend-novedades/`](frontend-novedades) | SPA en React 19 + TypeScript + Tailwind v4 |

---

## 🚀 Despliegue en Dokploy

Configuración de variables de entorno para los dominios reales `trapiche.manevoapp.com` y `api-novedades.manevoapp.com`.

### 1. Despliegue del Backend (`backend-novedades`)

1. En Dokploy, crea una nueva **Application**.
2. Selecciona tu repositorio de GitHub.
3. En la pestaña **General / Build**:
   - **Build Type:** `Dockerfile`
   - **Context Path:** `/backend-novedades`
   - **Dockerfile Path:** `/backend-novedades/Dockerfile`
4. En **Environment Variables**, configura exactamente lo siguiente:
   ```env
   APP_NAME="Trapiche Novedades"
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:GENERA_UN_APP_KEY_AQUI
   APP_URL=https://api-novedades.manevoapp.com
   FRONTEND_URL=https://trapiche.manevoapp.com

   DB_CONNECTION=sqlite
   DB_DATABASE=/var/www/html/storage/database.sqlite
   SESSION_DRIVER=database
   QUEUE_CONNECTION=database
   CACHE_STORE=database

   CORS_ALLOWED_ORIGINS=https://trapiche.manevoapp.com
   SANCTUM_STATEFUL_DOMAINS=trapiche.manevoapp.com,api-novedades.manevoapp.com
   SESSION_DOMAIN=.manevoapp.com

   RUN_MIGRATIONS=true
   RUN_SEED=true
   ```
   > 💡 *Nota:* Para generar una `APP_KEY` válida, ejecuta en tu terminal local: `php artisan key:generate --show`.

5. En **Domains / Port**:
   - **Host:** `api-novedades.manevoapp.com`
   - **Container Port:** `8000`
   - **HTTPS / SSL:** Habilitado (Let's Encrypt).

6. En **Volumes**:
   - Monta un volumen hacia `/var/www/html/storage` para no perder la base de datos SQLite ni archivos al re-desplegar.

7. Haz clic en **Deploy**.

---

### 2. Despliegue del Frontend (`frontend-novedades`)

1. En Dokploy, crea una segunda **Application**.
2. Selecciona el mismo repositorio de GitHub.
3. En la pestaña **General / Build**:
   - **Build Type:** `Dockerfile`
   - **Context Path:** `/frontend-novedades`
   - **Dockerfile Path:** `/frontend-novedades/Dockerfile`
4. En **Build Arguments** (o variables de entorno durante el build):
   ```env
   VITE_API_URL=https://api-novedades.manevoapp.com
   ```
5. En **Domains / Port**:
   - **Host:** `trapiche.manevoapp.com`
   - **Container Port:** `80`
   - **HTTPS / SSL:** Habilitado (Let's Encrypt).

6. Haz clic en **Deploy**.

---

## 💻 Ejecución Local con Docker Compose

Si deseas probar todo el entorno en tu máquina local usando Docker:

```bash
docker compose up --build -d
```

- **Frontend:** <http://localhost:5173>
- **Backend API:** <http://localhost:8000>

Credenciales de prueba por defecto:
- **Usuario:** `samuel.pineda@lujoseltrapiche.com`
- **Contraseña:** `password`

Para detener los contenedores:
```bash
docker compose down
```

---

## 🛠️ Arranque Local Tradicional (Sin Docker)

Requiere PHP 8.2+ y Node.js 18+.

**Terminal 1 (Backend):**
```bash
cd backend-novedades
php artisan migrate:fresh --seed
php artisan serve --port=8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend-novedades
npm install
npm run dev
```

---

## ⚡ Estado Actual y Características

- **Autenticación por sesión con Sanctum:** Control de acceso por rol (RBAC).
- **Tipos de novedad parametrizables:** Gestión Humana define formularios sin tocar código.
- **Registro guiado:** Selección de tipos con soporte para adjuntos.
- **Revisión agrupada por colaborador:** Aprobación/rechazo en lote por persona.
- **Trazabilidad y auditoría:** Registro detallado de cada acción realizada.
- **Notificaciones por correo:** Alertas al registrar o cambiar de estado una novedad.
- **Exportación a Excel:** Compatible con Siigo / Novasoft / Kactus.
- **Dashboard analítico:** Métricas de ausentismo y resúmenes por centro de costo.

---

## 🧪 Pruebas Automatizadas

```bash
cd backend-novedades && php artisan test
```
