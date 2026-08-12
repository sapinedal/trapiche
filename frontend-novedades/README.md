# frontend-novedades

SPA de **Gestión de Novedades de Personal** para Lujos El Trapiche.

## Stack

- React 19 + TypeScript + Vite
- TailwindCSS v4 (vía `@tailwindcss/vite`, sin `tailwind.config.js`)
- React Router v7 · React Hook Form + Zod · Axios · Sonner · Framer Motion · Lucide

## Puesta en marcha

El backend debe estar corriendo en `http://localhost:8000`.

```bash
npm install
npm run dev
```

`.env`:

```dotenv
VITE_API_URL=http://localhost:8000
```

## Estructura

```
public/brand/       Logotipo e isotipo oficiales
src/
├── components/ui/   Kit base: Button, Card, PageHeader, DataTable, Input,
│                    Select (portal), Modal, Badge, DateField, Spinner
├── layouts/         AppLayout, Sidebar (colapsable, con submenús), Header
├── lib/             axios (interceptores + CSRF), cn, format, zIndex
├── modules/
│   ├── admin/       Parametrización de tipos de novedad
│   ├── auth/        AuthContext, LoginPage, RequireAuth
│   ├── dashboard/   Métricas y análisis del periodo
│   ├── empleados/   Listado y filtros de personal
│   └── novedades/   Crear, Mis Novedades, Listar (resumen + aprobación)
├── routes/          Definición del router
└── types/           Tipos compartidos con la API
```

## Navegación

```
Inicio
Novedades ▸ Crear Novedad · Mis Novedades · Listar Novedades
Administración ▸ Personal · Tipos de Novedad
```

| Ruta | Menú | Quién entra | Qué hace |
| --- | --- | --- | --- |
| `/` | Inicio | Todos | Dashboard con métricas del periodo |
| `/novedades/nueva` | Novedades | Admin, Líder | Selección del tipo en tarjetas y formulario parametrizado |
| `/novedades/mias` | Novedades | Todos | Novedades que registró el usuario, con su traza |
| `/novedades` | Novedades | Admin, Líder | Resumen por colaborador, aprobación y export a Excel |
| `/empleados` | Administración | Admin, Líder | Personal activo (el líder solo ve su equipo) |
| `/admin/tipos-novedad` | Administración | Admin | Parametrización de tipos y sus campos |

El grupo **Administración** no restringe por rol: se muestra si al menos uno de
sus hijos es visible. Así el líder llega a su personal sin ver la
parametrización, que sí es exclusiva de Gestión Humana.

El guardado de rutas se hace con `RequireAuth roles={[...]}`, en paralelo al
filtrado del sidebar: ocultar un enlace no basta, la ruta también se protege —
y la API lo vuelve a validar con `EmployeePolicy::viewAny`.

## Formularios parametrizados

`DynamicFields` renderiza los campos que Gestión Humana definió para cada tipo
(`novelty_types.config.fields`). Agregar un campo nuevo desde
`/admin/tipos-novedad` no requiere tocar el código de la SPA.

La validación es doble: la SPA marca los obligatorios antes de enviar, y el
backend vuelve a validarlos contra el esquema — los errores que regresan como
`data.<id>` se mapean de vuelta al campo correspondiente.

## Identidad visual

La paleta se extrajo de los propios activos de marca de
[lujoseltrapiche.com](https://lujoseltrapiche.com):

| Token | Valor | Origen |
| --- | --- | --- |
| `primary-500` | `#283276` | Color exacto del isotipo |
| `brand-deep` | `#1A0A80` | Índigo del logotipo |
| `secondary-500` | `#00A99D` | Turquesa de apoyo para acciones de confirmación |

Tipografía **DM Sans**. Todos los tokens viven en el bloque `@theme` de
`src/index.css`, así que la paleta se ajusta en un solo lugar.

El lenguaje de componentes (tarjetas `rounded-xl` con sombra, tablas con
cabecera en versalitas y filas cebra, sidebar blanco colapsable con cabecera en
color primario) sigue el sistema de **Trazalo** para que ambos productos se
sientan parte de la misma familia.

### Sobre los archivos de logo

`public/brand/` contiene los activos originales descargados del sitio público:
el logotipo mide 158×27 px y el isotipo 91×83 px — son los tamaños nativos que
publica la tienda. Se ven bien a los tamaños en que se usan, pero si el equipo
de diseño puede entregar SVG o PNG en mayor resolución, reemplazarlos mejoraría
la nitidez en pantallas retina. Sobre fondo primario se invierten a blanco con
`brightness-0 invert`.

## Autenticación

Sanctum por cookies de sesión, no por tokens en `localStorage`. `src/lib/axios.ts`
usa `withCredentials` + `withXSRFToken`, y `ensureCsrfCookie()` obtiene la cookie
CSRF antes del login. En el arranque `AuthContext` consulta `/api/me`; un `401` ahí
es el sondeo normal de "¿hay sesión?" y se maneja mostrando el login.

## Capas de superposición

Los portales comparten una escala única en `src/lib/zIndex.ts`
(`modal: 1100 < popover: 1200 < toast: 1300`). Cualquier popover nuevo debe leer de
ahí: un `Select` abierto dentro de un modal necesita superar al modal, o
desaparece tras el fondo.

## Comandos

```bash
npm run dev      # servidor de desarrollo
npm run build    # typecheck + build de producción
npm run lint     # oxlint
```

## Nota de seguridad

`npm audit` reporta un aviso de `react-router` sobre su modo **RSC / server
actions**. Esta app es una SPA de cliente sin SSR, por lo que ese código no se
ejecuta. Se mantiene la versión estable más reciente; conviene revisarlo al
actualizar.

## Pendiente (siguientes fases)

- Alta/edición de colaboradores y carga masiva por Excel/CSV.
- Módulo de cierre de nómina (el backend tiene las tablas y la regla de bloqueo).
- Paginación en las tablas (la API ya devuelve `meta.last_page`).
- Reordenar campos arrastrando en la parametrización; hoy se agregan y borran.
