# backend-novedades

API REST para la **Gestión de Novedades de Personal** de Lujos El Trapiche.

> Este sistema **no** incluye cuadro de turnos, cuadrantes ni planificación horaria.

## Stack

- Laravel 12 (PHP 8.2+) — *Laravel 11 está bloqueado por avisos de seguridad de Composer; 12 es el sucesor estable y compatible.*
- Laravel Sanctum (autenticación SPA por cookies de sesión)
- SQLite en desarrollo · MySQL/PostgreSQL en producción

## Puesta en marcha

```bash
composer install
php artisan migrate:fresh --seed
php artisan serve --port=8000
```

Usuarios sembrados (contraseña `password` en todos — **cámbiala antes de producción**):

| Correo | Rol |
| --- | --- |
| `samuel.pineda@lujoseltrapiche.com` | admin |
| `gerencia@lujoseltrapiche.com` | admin |
| `karen.cano@lujoseltrapiche.com` | leader |
| `juan.camilo@lujoseltrapiche.com` | leader |
| `edwin.giraldo@lujoseltrapiche.com` | leader |
| `lili.morales@lujoseltrapiche.com` | leader |

## Arquitectura

Controller → Service → Repository, con las interfaces enlazadas en
`app/Providers/RepositoryServiceProvider.php`.

```
app/
├── Http/
│   ├── Controllers/Api/   AuthController, EmployeeController, NoveltyController, …
│   ├── Requests/          Validación por Form Request (Auth/, Employee/, Novelty/)
│   ├── Resources/         Respuestas uniformes: { data, message, status }
│   └── Middleware/        EnsureUserHasRole (alias `role:admin,leader`)
├── Models/                User, Employee, Novelty, NoveltyType, CostCenter, PayrollClosure…
├── Policies/              EmployeePolicy, NoveltyPolicy
├── Repositories/
│   ├── Contracts/         Interfaces
│   └── Eloquent/          Implementaciones
└── Services/              Reglas de negocio (EmployeeService, NoveltyService)
```

### Alcance por rol (RBAC)

El alcance se aplica en la **capa de servicio**, no en el controlador, para que
ningún filtro enviado por el cliente pueda ampliarlo:

- **admin** — acceso total a todo el personal y todas las novedades.
- **leader** — solo su personal a cargo (`employees.leader_user_id`). Enviar
  `?leader_user_id=<otro>` no amplía el alcance, y registrar una novedad para
  personal ajeno devuelve `422`.
- **employee** — consulta de sus propias novedades (fase 2).

Cubierto por `tests/Feature/NoveltyScopeTest.php`:

```bash
php artisan test
```

## Esquema de base de datos

| Tabla | Propósito |
| --- | --- |
| `users` | Cuentas de acceso con `role` (admin/leader/employee) |
| `cost_centers` | Centros de costo / operaciones |
| `employees` | Nómina de colaboradores; FK a centro de costo y a su líder |
| `novelty_types` | Catálogo parametrizable (categoría, si es remunerada, si exige soporte) |
| `novelties` | Registro de novedades con estado y trazabilidad de aprobación |
| `payroll_closures` | Periodos de cierre (quincenal/mensual) |
| `payroll_closure_employees` | Confirmación por colaborador, incluso sin novedades |

Índices pensados para las consultas reales: `(employee_id, start_date, end_date)`,
`(status, start_date)` y `(cost_center_id, status)`.

## Endpoints

| Método | Ruta | Notas |
| --- | --- | --- |
| `POST` | `/api/login` | Requiere `GET /sanctum/csrf-cookie` previo |
| `POST` | `/api/logout` | |
| `GET` | `/api/me` | Usuario autenticado |
| `GET` | `/api/dashboard/stats` | Métricas del periodo, dentro del alcance del rol |
| `GET` | `/api/cost-centers` | |
| `GET` `POST` | `/api/employees` | Filtros: `search`, `cost_center_id`, `status` |
| `GET` `PUT` `DELETE` | `/api/employees/{id}` | Escritura solo admin |
| `GET` `POST` | `/api/novelties` | Filtros: `status`, `date_from`, `date_to`, `cost_center_id`… |
| `GET` | `/api/novelties/mine` | Novedades registradas por el usuario |
| `GET` | `/api/novelties/summary` | Agrupadas por colaborador, para revisión |
| `GET` | `/api/novelties/export` | Consolidado `.xlsx` respetando los filtros |
| `GET` | `/api/novelties/{id}` | Incluye la bitácora de auditoría |
| `PATCH` | `/api/novelties/{id}` | Aprobar / rechazar / anular |
| `GET` | `/api/novelty-types` | `?include_inactive=1` para parametrización |
| `POST` `PUT` `DELETE` | `/api/novelty-types/{id}` | Solo admin |

## Tipos de novedad parametrizables

Cada tipo guarda su formulario en `novelty_types.config`, de modo que Gestión
Humana puede crear una novedad nueva sin tocar código:

```jsonc
{
  "measurement": "days",          // o "hours"
  "requires_approval": true,
  "fields": [
    { "id": "eps", "label": "EPS", "type": "text", "required": true },
    { "id": "prorroga", "label": "¿Es prórroga?", "type": "select",
      "required": true, "options": ["No", "Sí"] }
  ]
}
```

Tipos de campo admitidos: `text`, `textarea`, `number`, `date`, `time`,
`select`, `checklist`. Los valores capturados se guardan en `novelties.data` y
se validan contra este esquema en `StoreNoveltyRequest`, así que un campo
obligatorio o una opción inválida se rechazan en el servidor, no solo en la SPA.

Un tipo que ya tiene novedades no se elimina: se desactiva, para no romper el
histórico.

## Trazabilidad

`novelty_audit_logs` guarda cada acción (quién, qué, cuándo, desde qué estado y
hacia cuál, con IP). Las columnas `reviewed_by` / `reviewed_at` de `novelties`
solo conservan la última decisión; la bitácora conserva el historial completo,
que es lo que permite auditar el proceso ante nómina.

Toda escritura pasa por `NoveltyService`, que registra la traza dentro de la
misma transacción — así una acción nueva no puede quedarse sin auditar.

## Notificaciones

Al aprobar o rechazar se notifica por correo a quien registró la novedad
(`NoveltyReviewed`). Con `MAIL_MAILER=log` el correo queda en
`storage/logs/laravel.log`, así que el flujo es verificable sin SMTP. Para
producción basta configurar el mailer real y poner `QUEUE_CONNECTION=database`
con un worker corriendo.

El envío está aislado en un `try/catch`: si el correo falla, la aprobación ya
quedó registrada y auditada.

## Configuración

`.env` relevante para la SPA:

```dotenv
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

## Pendiente (siguientes fases)

- Módulo de cierre de nómina: las tablas `payroll_closures` y
  `payroll_closure_employees` ya existen, igual que la regla que bloquea el
  cierre con pendientes (`NoveltyService::hasPendingForEmployees()`); faltan los
  endpoints y la pantalla.
- Carga masiva de personal por Excel/CSV.
- Alta y edición de colaboradores desde la SPA (la API ya lo soporta).
- Configurar SMTP real y un worker de cola para las notificaciones.
