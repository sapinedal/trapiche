import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileArchive,
  FilePlus,
  FileBarChart,
  FileText,
  Settings,
  ClipboardType,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/modules/auth/AuthContext";
import type { UserRole } from "@/types";

interface NavChild {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  to?: string;
  end?: boolean;
  roles?: UserRole[];
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { id: "inicio", label: "Inicio", icon: LayoutDashboard, to: "/", end: true },
  {
    id: "novedades",
    label: "Novedades",
    icon: FileArchive,
    children: [
      { to: "/novedades/nueva", label: "Crear Novedad", icon: FilePlus, roles: ["admin", "leader"] },
      { to: "/novedades/mias", label: "Mis Novedades", icon: FileBarChart },
      { to: "/novedades", label: "Listar Novedades", icon: FileText, roles: ["admin", "leader"] },
    ],
  },
  {
    id: "admin",
    label: "Administración",
    icon: Settings,
    // El grupo no restringe por rol: se muestra si al menos un hijo es visible,
    // así el líder llega a su personal sin ver la parametrización.
    children: [
      { to: "/empleados", label: "Personal", icon: Users, roles: ["admin", "leader"] },
      {
        to: "/admin/tipos-novedad",
        label: "Tipos de Novedad",
        icon: ClipboardType,
        roles: ["admin"],
      },
    ],
  },
];

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isExpanded, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const showLabels = isExpanded || isMobileOpen;
  const location = useLocation();
  const { user } = useAuth();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const allowed = (roles?: UserRole[]) => !roles || (user != null && roles.includes(user.role));

  const items = navItems
    .filter((item) => allowed(item.roles))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => allowed(child.roles)),
    }))
    .filter((item) => item.to || (item.children && item.children.length > 0));

  /** Al navegar directo a una subruta, el grupo que la contiene queda abierto. */
  useEffect(() => {
    const parent = items.find((item) =>
      item.children?.some((child) => location.pathname === child.to)
    );
    if (parent) setOpenGroup(parent.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleGroup = (id: string) => {
    // Colapsar el sidebar y abrir un grupo a la vez son incompatibles:
    // al pulsar un grupo estando colapsado, primero se expande.
    if (!showLabels) {
      onToggle();
      setOpenGroup(id);
      return;
    }
    setOpenGroup((current) => (current === id ? null : id));
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed z-50 flex h-screen flex-col bg-white shadow-xl transition-all duration-300 ease-in-out",
          "md:relative md:z-auto md:shadow-sm",
          isExpanded ? "w-64" : "w-20",
          isMobileOpen ? "w-[280px] translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Cabecera de marca. El logotipo original es índigo sobre blanco; aquí
            va sobre el primario, así que se invierte a blanco por contraste. */}
        <div className="flex h-[68px] shrink-0 items-center gap-2 overflow-hidden border-b border-neutral-200 bg-primary-500 px-4">
          {showLabels ? (
            <>
              <img
                src="/brand/trapiche-logo.png"
                alt="Lujos El Trapiche"
                className="logo-transition h-6 w-auto flex-1 object-contain object-left brightness-0 invert"
              />
              <button
                type="button"
                onClick={isMobileOpen ? onMobileClose : onToggle}
                aria-label="Contraer menú"
                className="rounded-lg p-2 text-white transition-colors hover:bg-primary-400/50"
              >
                <X className="animate-scale-in size-5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onToggle}
              aria-label="Expandir menú"
              className="group relative mx-auto rounded-lg p-1.5 transition-colors hover:bg-primary-400/50"
            >
              <img
                src="/brand/trapiche-isotipo.png"
                alt="Lujos El Trapiche"
                className="h-7 w-auto brightness-0 invert transition-opacity group-hover:opacity-0"
              />
              <Menu className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {items.map((item) => {
            const Icon = item.icon;

            if (!item.children?.length) {
              return (
                <NavLink
                  key={item.id}
                  to={item.to!}
                  end={item.end}
                  onClick={onMobileClose}
                  title={showLabels ? undefined : item.label}
                  className={({ isActive }) =>
                    cn(
                      "sidebar-item-hover flex items-center rounded-lg px-3 py-2.5 transition-all duration-300",
                      isActive
                        ? "bg-primary-500 font-semibold text-white shadow-lg"
                        : "text-neutral-700 hover:bg-primary-50 hover:text-primary-600",
                      showLabels ? "w-full" : "w-10 justify-center"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          "size-5 shrink-0",
                          isActive ? "text-white" : "text-neutral-600"
                        )}
                      />
                      <span
                        className={cn(
                          "overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300",
                          showLabels ? "ml-3 max-w-[200px] opacity-100" : "ml-0 max-w-0 opacity-0"
                        )}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            }

            const isGroupOpen = openGroup === item.id && showLabels;
            const hasActiveChild = item.children.some((child) => location.pathname === child.to);

            return (
              <div key={item.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.id)}
                  title={showLabels ? undefined : item.label}
                  className={cn(
                    "sidebar-item-hover flex items-center rounded-lg px-3 py-2.5 transition-all duration-300",
                    hasActiveChild && !isGroupOpen
                      ? "bg-primary-50 font-semibold text-primary-600"
                      : "text-neutral-700 hover:bg-primary-50 hover:text-primary-600",
                    showLabels ? "w-full justify-between" : "w-10 justify-center"
                  )}
                >
                  <span className="flex min-w-0 items-center">
                    <Icon className="size-5 shrink-0 text-neutral-600" />
                    <span
                      className={cn(
                        "overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300",
                        showLabels ? "ml-3 max-w-[160px] opacity-100" : "ml-0 max-w-0 opacity-0"
                      )}
                    >
                      {item.label}
                    </span>
                  </span>
                  {showLabels && (
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-neutral-400 transition-transform duration-300",
                        isGroupOpen && "rotate-180"
                      )}
                    />
                  )}
                </button>

                <div
                  className={cn(
                    "submenu-transition grid",
                    isGroupOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="ml-4 space-y-1 overflow-hidden">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end
                          onClick={onMobileClose}
                          className={({ isActive }) =>
                            cn(
                              "animate-slide-in-right flex items-center rounded-lg px-3 py-2 transition-all duration-200",
                              isActive
                                ? "bg-secondary-500 font-semibold text-white shadow-md"
                                : "text-neutral-600 hover:bg-secondary-50 hover:text-secondary-600"
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <ChildIcon
                                className={cn(
                                  "mr-3 size-4 shrink-0",
                                  isActive ? "text-white" : "text-neutral-500"
                                )}
                              />
                              <span className="truncate text-sm font-medium">{child.label}</span>
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
