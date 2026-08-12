import { api } from "@/lib/axios";
import type {
  ApiEnvelope,
  Novelty,
  NoveltySummaryRow,
  NoveltyType,
  Paginated,
} from "@/types";

export interface NoveltyFilters {
  status?: string;
  novelty_type_id?: string;
  employee_id?: string;
  category?: string;
  cost_center_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
}

export async function fetchNovelties(filters: NoveltyFilters = {}): Promise<Paginated<Novelty>> {
  const { data } = await api.get<Paginated<Novelty>>("/novelties", { params: filters });
  return data;
}

/** Novedades registradas por el usuario autenticado. */
export async function fetchMyNovelties(filters: NoveltyFilters = {}): Promise<Paginated<Novelty>> {
  const { data } = await api.get<Paginated<Novelty>>("/novelties/mine", { params: filters });
  return data;
}

/** Resumen agrupado por colaborador para la vista de revisión. */
export async function fetchNoveltySummary(
  filters: NoveltyFilters = {}
): Promise<NoveltySummaryRow[]> {
  const { data } = await api.get<ApiEnvelope<NoveltySummaryRow[]>>("/novelties/summary", {
    params: filters,
  });
  return data.data;
}

export async function fetchNovelty(id: number): Promise<Novelty> {
  const { data } = await api.get<ApiEnvelope<Novelty>>(`/novelties/${id}`);
  return data.data;
}

export async function fetchNoveltyTypes(includeInactive = false): Promise<NoveltyType[]> {
  const { data } = await api.get<ApiEnvelope<NoveltyType[]>>("/novelty-types", {
    params: includeInactive ? { include_inactive: 1 } : undefined,
  });
  return data.data;
}

export interface CreateNoveltyPayload {
  employee_id: number;
  novelty_type_id: number;
  start_date: string;
  end_date: string;
  total_days?: number;
  total_hours?: number;
  observations?: string;
  data?: Record<string, string | string[]>;
  attachment?: File | null;
}

export async function createNovelty(payload: CreateNoveltyPayload): Promise<Novelty> {
  // Se envía como multipart solo cuando hay soporte adjunto; en JSON plano
  // los arrays de checklist viajan mejor tipados.
  if (payload.attachment) {
    const form = new FormData();
    form.append("employee_id", String(payload.employee_id));
    form.append("novelty_type_id", String(payload.novelty_type_id));
    form.append("start_date", payload.start_date);
    form.append("end_date", payload.end_date);
    if (payload.total_days != null) form.append("total_days", String(payload.total_days));
    if (payload.total_hours != null) form.append("total_hours", String(payload.total_hours));
    if (payload.observations) form.append("observations", payload.observations);
    Object.entries(payload.data ?? {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => form.append(`data[${key}][]`, item));
      } else {
        form.append(`data[${key}]`, value);
      }
    });
    form.append("attachment", payload.attachment);

    const { data } = await api.post<ApiEnvelope<Novelty>>("/novelties", form);
    return data.data;
  }

  const { attachment: _attachment, ...json } = payload;
  const { data } = await api.post<ApiEnvelope<Novelty>>("/novelties", json);
  return data.data;
}

export async function updateNoveltyStatus(
  id: number,
  status: "approved" | "rejected" | "annulled",
  rejectionReason?: string
): Promise<Novelty> {
  const { data } = await api.patch<ApiEnvelope<Novelty>>(`/novelties/${id}`, {
    status,
    rejection_reason: rejectionReason,
  });
  return data.data;
}

/** Descarga el consolidado en Excel respetando los filtros activos. */
export async function downloadNoveltiesExcel(filters: NoveltyFilters = {}): Promise<void> {
  const response = await api.get("/novelties/export", {
    params: filters,
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(response.data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `consolidado_novedades_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
