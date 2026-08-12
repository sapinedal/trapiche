import { api } from "@/lib/axios";
import type { ApiEnvelope, NoveltyCategory, NoveltyField, NoveltyType } from "@/types";

export interface NoveltyTypePayload {
  name: string;
  description?: string | null;
  code: string;
  category: NoveltyCategory;
  is_paid: boolean;
  requires_attachment: boolean;
  is_active?: boolean;
  config: {
    measurement: "days" | "hours";
    requires_approval: boolean;
    max_days?: number | null;
    fields: NoveltyField[];
  };
}

export async function fetchAllNoveltyTypes(): Promise<NoveltyType[]> {
  const { data } = await api.get<ApiEnvelope<NoveltyType[]>>("/novelty-types", {
    params: { include_inactive: 1 },
  });
  return data.data;
}

export async function createNoveltyType(payload: NoveltyTypePayload): Promise<NoveltyType> {
  const { data } = await api.post<ApiEnvelope<NoveltyType>>("/novelty-types", payload);
  return data.data;
}

export async function updateNoveltyType(
  id: number,
  payload: NoveltyTypePayload
): Promise<NoveltyType> {
  const { data } = await api.put<ApiEnvelope<NoveltyType>>(`/novelty-types/${id}`, payload);
  return data.data;
}

/** El backend desactiva en vez de borrar si el tipo ya tiene novedades. */
export async function deleteNoveltyType(id: number): Promise<string | null> {
  const { data } = await api.delete<ApiEnvelope<null>>(`/novelty-types/${id}`);
  return data.message;
}
