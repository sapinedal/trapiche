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

[Dokploy](https://dokploy.com/) permite desplegar tanto con **Dockerfiles individuales** como con **Docker Compose**. Dado que esta aplicación consta de un **Backend (API Laravel)** y un **Frontend (React SPA)**, se recomienda desplegarlos como **2 Servicios / Aplicaciones** independientes en Dokploy dentro del mismo proyecto.

### Opción Recomendada: Despliegue como 2 Servicios en Dokploy

#### 1. Despliegue del Backend (`backend-novedades`)

1. En Dokploy, crea una nueva **Application**.
2. Selecciona tu proveedor de Git (GitHub, GitLab, etc.) y conecta este repositorio.
3. Configura los siguientes parámetros en la pestaña **General / Build**:
   - **Build Type:** `Dockerfile`
   - **Context Path:** `/backend-novedades`
   - **Dockerfile Path:** `/backend-novedades/Dockerfile`
4. En la sección **Environment Variables**, configura:
   ```env
   APP_NAME="Trapiche Novedades"
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:COPIA_AQUI_UN_APP_KEY_VALIDO_DE_LARAVEL
   APP_URL=https://api-novedades.midominio.com
   FRONTEND_URL=https://novedades.midominio.com
   DB_CONNECTION=sqlite
   DB_DATABASE=/var/www/html/storage/database.sqlite
   SESSION_DRIVER=database
   QUEUE_CONNECTION=database
   CACHE_STORE=database
   CORS_ALLOWED_ORIGINS=https://novedades.midominio.com
   SANCTUM_STATEFUL_DOMAINS=novedades.midominio.com,api-novedades.midominio.com
   RUN_MIGRATIONS=true
   RUN_SEED=true
   ```
   > 💡 *Nota:* Para generar un `APP_KEY` válido de Laravel puedes ejecutar en local `php artisan key:generate --show`.

5. En la sección **Domains / Port**:
   - Asigna el dominio público para la API (ej: `api-novedades.midominio.com`).
   - Define el puerto del contenedor: `8000`.

6. En la sección **Volumes** (para no perder la base de datos SQLite ni adjuntos al re-desplegar):
   - Monta un volumen persistente hacia `/var/www/html/storage`.

7. Haz clic en **Deploy**.

---

#### 2. Despliegue del Frontend (`frontend-novedades`)

1. En Dokploy, crea otra **Application**.
2. Conecta el mismo repositorio Git.
3. Configura en la pestaña **General / Build**:
   - **Build Type:** `Dockerfile`
   - **Context Path:** `/frontend-novedades`
   - **Dockerfile Path:** `/frontend-novedades/Dockerfile`
4. En **Build Arguments** (o Environment Variables de Build):
   ```env
   VITE_API_URL=https://api-novedades.midominio.com
   ```
5. En la sección **Domains / Port**:
   - Asigna el dominio de la interfaz de usuario (ej: `novedades.midominio.com`).
   - Define el puerto del contenedor: `80`.

6. Haz clic en **Deploy**.

---

### Opción Alternativa: Despliegue con Docker Compose en Dokploy

Dokploy también permite desplegar usando `docker-compose.yml`:

1. En Dokploy, crea una aplicación de tipo **Compose**.
2. Apunta a este repositorio y selecciona la ruta de `docker-compose.yml`.
3. Ajusta las variables de entorno (`APP_KEY`, `APP_URL`, `VITE_API_URL`, `CORS_ALLOWED_ORIGINS`, `SANCTUM_STATEFUL_DOMAINS`) con tus dominios reales antes de desplegar.

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
