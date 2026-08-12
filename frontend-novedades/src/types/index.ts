export type UserRole = "admin" | "leader" | "employee";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface CostCenter {
  id: number;
  name: string;
  code: string;
}

export type EmployeeStatus = "active" | "inactive";
export type ContractType =
  | "indefinido"
  | "fijo"
  | "obra_labor"
  | "prestacion_servicios"
  | "aprendizaje";
export type DocumentType = "CC" | "CE" | "PA" | "TI" | "PEP";

export interface Employee {
  id: number;
  document_type: DocumentType;
  document_number: string;
  full_name: string;
  position: string;
  cost_center: { id: number; name: string };
  leader: { id: number; name: string } | null;
  email: string | null;
  phone: string | null;
  hire_date: string | null;
  contract_type: ContractType;
  base_salary: string | null;
  status: EmployeeStatus;
  created_at: string;
}

export type NoveltyCategory =
  | "incapacidad"
  | "licencia"
  | "permiso"
  | "ausentismo"
  | "hora_extra"
  | "retiro_vacaciones";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "time"
  | "select"
  | "checklist";

/** Campo parametrizable definido por Gestión Humana para un tipo de novedad. */
export interface NoveltyField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

export interface NoveltyTypeConfig {
  measurement: "days" | "hours";
  requires_approval: boolean;
  max_days: number | null;
  fields: NoveltyField[];
}

export interface NoveltyType {
  id: number;
  name: string;
  description: string | null;
  code: string;
  category: NoveltyCategory;
  is_paid: boolean;
  requires_attachment: boolean;
  is_active: boolean;
  config: NoveltyTypeConfig;
  novelties_count?: number;
}

export type NoveltyStatus = "pending" | "approved" | "rejected" | "annulled";

export type AuditAction = "created" | "approved" | "rejected" | "annulled" | "updated";

export interface AuditLogEntry {
  action: AuditAction;
  from_status: string | null;
  to_status: string | null;
  performed_by: string | null;
  performed_at: string;
  notes: string | null;
}

export interface Novelty {
  id: number;
  employee: { id: number; full_name: string; cost_center: string };
  novelty_type: { id: number; name: string; category: NoveltyCategory };
  start_date: string;
  end_date: string;
  total_days: string | null;
  total_hours: string | null;
  observations: string | null;
  /** Valores de los campos parametrizados del tipo. */
  data: Record<string, string | string[]>;
  attachment_url: string | null;
  status: NoveltyStatus;
  requested_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  audit_logs?: AuditLogEntry[];
}

/** Fila del resumen agrupado por colaborador. */
export interface NoveltySummaryRow {
  employee: {
    id: number;
    full_name: string;
    document_number: string;
    position: string;
    cost_center: string | null;
    leader: string | null;
  };
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  annulled: number;
  total_days: number;
  total_hours: number;
  novelty_ids: number[];
}

export interface DashboardStats {
  period: { from: string; to: string };
  totals: {
    active_employees: number;
    novelties: number;
    pending: number;
    approved: number;
    rejected: number;
    absence_days: number;
    employees_with_novelties: number;
  };
  by_category: { category: string; count: number; days: number }[];
  by_cost_center: { cost_center: string; count: number; days: number }[];
  top_employees: {
    employee: string;
    cost_center: string | null;
    count: number;
    days: number;
  }[];
}

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface ApiEnvelope<T> {
  data: T;
  message: string | null;
  status: "success" | "error";
}
