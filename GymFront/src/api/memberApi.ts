import type { Member } from "../types/member";
import type { DashboardStatsDTO, ProgressOverviewDTO } from "../types/progress";
import { getAuthHeaders } from "./apiClient";

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? ""}/api`;

export async function fetchMemberById(): Promise<Member> {
  const res = await fetch(`${API_BASE_URL}/members/me`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch member");
  return res.json();
}

export async function updateMember(
  data: { name: string; email: string }
): Promise<Member> {
  const res = await fetch(`${API_BASE_URL}/members/me`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update member");
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStatsDTO> {
  const res = await fetch(`${API_BASE_URL}/members/me/dashboard-stats`, { headers: getAuthHeaders() });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function fetchProgressOverview(): Promise<ProgressOverviewDTO> {
  const res = await fetch(`${API_BASE_URL}/members/me/progress-overview`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch progress overview");
  return res.json();
}