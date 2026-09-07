import type { CreateGoalPayload, Goal } from "../types/goal";
import { getAuthHeaders } from "./apiClient";

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? ""}/api`;

export async function fetchGoalsByMember(): Promise<Goal[]> {
  const res = await fetch(`${API_BASE_URL}/goals`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch goals");
  return res.json();
}

export async function fetchGoalById(id: string): Promise<Goal> {
  const res = await fetch(`${API_BASE_URL}/goals/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch goal");
  return res.json();
}

export async function createGoal(payload: Omit<CreateGoalPayload, 'memberId'>): Promise<Goal> {
  const res = await fetch(`${API_BASE_URL}/goals`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create goal");
  return res.json();
}

export async function deleteGoal(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/goals/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete goal");
}