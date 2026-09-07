export interface RegisterRequestDTO {
  name: string;
  email: string;
  password?: string;
}

export interface LoginRequestDTO {
  email: string;
  password?: string;
}

export interface AuthResponseDTO {
  token: string;
  memberId: string;
  name: string;
  email: string;
  role: string;
}
