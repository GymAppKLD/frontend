import type { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO } from "../types/authDto";

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? ""}/api`;

export async function login(data: LoginRequestDTO): Promise<AuthResponseDTO> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Invalid credentials");
  }
  return res.json();
}

export async function register(data: RegisterRequestDTO): Promise<AuthResponseDTO> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Registration failed");
  }
  return res.json();
}
