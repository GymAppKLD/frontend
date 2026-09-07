export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  memberId: string;
  name: string;
  email: string;
  role: string;
}
