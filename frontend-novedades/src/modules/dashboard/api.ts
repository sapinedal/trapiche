import { api } from "@/lib/axios";
import type { ApiEnvelope, DashboardStats } from "@/types";

export async function fetchDashboardStats(params: {
  date_from?: string;
  date_to?: string;
} = {}): Promise<DashboardStats> {
  const { data } = await api.get<ApiEnvelope<DashboardStats>>("/dashboard/stats", { params });
  return data.data;
}
