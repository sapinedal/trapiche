import {
  Clock,
  Moon,
  Stethoscope,
  CalendarX,
  UserMinus,
  LifeBuoy,
  Plane,
  Heart,
  Shield,
  Baby,
  Timer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NoveltyCategory } from "@/types";

/**
 * Ícono por tipo de novedad. Se resuelve por nombre y cae a la categoría, de
 * modo que un tipo nuevo creado desde parametrización siempre tenga ícono.
 */
export function getNoveltyIcon(name: string, category: NoveltyCategory): LucideIcon {
  const value = name.toLowerCase();

  if (value.includes("maternidad") || value.includes("paternidad")) return Baby;
  if (value.includes("incapacidad")) return Stethoscope;
  if (value.includes("cita")) return Stethoscope;
  if (value.includes("calamidad")) return LifeBuoy;
  if (value.includes("vacacion")) return Plane;
  if (value.includes("retiro")) return UserMinus;
  if (value.includes("licencia")) return Heart;
  if (value.includes("permiso")) return Shield;
  if (value.includes("ausent")) return CalendarX;
  if (value.includes("recargo") || value.includes("nocturn")) return Moon;
  if (value.includes("extra")) return Timer;

  const byCategory: Record<NoveltyCategory, LucideIcon> = {
    incapacidad: Stethoscope,
    licencia: Heart,
    permiso: Shield,
    ausentismo: CalendarX,
    hora_extra: Timer,
    retiro_vacaciones: Plane,
  };

  return byCategory[category] ?? Clock;
}

export const categoryLabels: Record<NoveltyCategory, string> = {
  incapacidad: "Incapacidad",
  licencia: "Licencia",
  permiso: "Permiso",
  ausentismo: "Ausentismo",
  hora_extra: "Horas extra / Recargos",
  retiro_vacaciones: "Retiro y vacaciones",
};
