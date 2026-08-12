import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth/AuthContext";
import { cn } from "@/lib/cn";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  leader: "Líder de Área",
  employee: "Colaborador",
};

export function Header({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      toast.error("No se pudo cerrar sesión. Intenta de nuevo.");
    }
  };

  const initials = user?.name
    ?.split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-neutral-200 bg-white px-4 shadow-sm sm:px-6">
      <button
        type="button"
        onClick={onMobileMenuOpen}
        aria-label="Abrir menú"
        className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden md:block">
        <p className="text-sm font-semibold text-neutral-800">Gestión de Novedades de Personal</p>
        <p className="text-xs text-neutral-400">Lujos El Trapiche</p>
      </div>

      <div className="relative ml-auto" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-3 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors hover:bg-neutral-100"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold uppercase text-white">
            {initials}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold leading-tight text-neutral-800">
              {user?.name}
            </span>
            <span className="block text-xs leading-tight text-neutral-500">
              {roleLabels[user?.role ?? ""] ?? user?.role}
            </span>
          </span>
          <ChevronDown
            className={cn("size-4 text-neutral-400 transition-transform", open && "rotate-180")}
          />
        </button>

        {open && (
          <div className="animate-scale-in absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
            <div className="border-b border-neutral-100 px-4 py-3 sm:hidden">
              <p className="text-sm font-semibold text-neutral-800">{user?.name}</p>
              <p className="text-xs text-neutral-500">{roleLabels[user?.role ?? ""] ?? user?.role}</p>
            </div>
            <div className="border-b border-neutral-100 px-4 py-3">
              <p className="truncate text-xs text-neutral-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-error-500 transition-colors hover:bg-error-500/10"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
