import { api, ensureCsrfCookie } from "@/lib/axios";
import type { ApiEnvelope, User } from "@/types";

export async function login(email: string, password: string): Promise<User> {
  await ensureCsrfCookie();
  const { data } = await api.post<ApiEnvelope<User>>("/login", { email, password });
  return data.data;
}

export async function logout(): Promise<void> {
  await api.post("/logout");
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<ApiEnvelope<User>>("/me");
  return data.data;
}
