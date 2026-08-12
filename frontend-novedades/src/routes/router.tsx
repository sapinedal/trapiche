import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { RequireAuth } from "@/modules/auth/RequireAuth";
import { LoginPage } from "@/modules/auth/LoginPage";
import { DashboardPage } from "@/modules/dashboard/DashboardPage";
import { EmployeesListPage } from "@/modules/empleados/EmployeesListPage";
import { ListarNovedadesPage } from "@/modules/novedades/ListarNovedadesPage";
import { CrearNovedadPage } from "@/modules/novedades/CrearNovedadPage";
import { MisNovedadesPage } from "@/modules/novedades/MisNovedadesPage";
import { TiposNovedadPage } from "@/modules/admin/TiposNovedadPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/novedades/mias", element: <MisNovedadesPage /> },

          // Consultar personal, registrar y revisar son acciones de líder o
          // administrador. El líder solo alcanza a su propio equipo.
          {
            element: <RequireAuth roles={["admin", "leader"]} />,
            children: [
              { path: "/empleados", element: <EmployeesListPage /> },
              { path: "/novedades", element: <ListarNovedadesPage /> },
              { path: "/novedades/nueva", element: <CrearNovedadPage /> },
            ],
          },

          {
            element: <RequireAuth roles={["admin"]} />,
            children: [{ path: "/admin/tipos-novedad", element: <TiposNovedadPage /> }],
          },

          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
