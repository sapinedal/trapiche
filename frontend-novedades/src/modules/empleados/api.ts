import { api } from "@/lib/axios";
import type { ApiEnvelope, CostCenter, Employee, Paginated } from "@/types";

export interface EmployeeFilters {
  search?: string;
  cost_center_id?: string;
  status?: string;
  page?: number;
}

export async function fetchEmployees(filters: EmployeeFilters = {}): Promise<Paginated<Employee>> {
  const { data } = await api.get<Paginated<Employee>>("/employees", { params: filters });
  return data;
}

export async function fetchCostCenters(): Promise<CostCenter[]> {
  const { data } = await api.get<ApiEnvelope<CostCenter[]>>("/cost-centers");
  return data.data;
}
