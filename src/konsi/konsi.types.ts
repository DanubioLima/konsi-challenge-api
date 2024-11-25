export interface Benefit {
  numero_beneficio: string;
  codigo_beneficio: string;
}

export interface BenefitDataResponse {
  cpf: string;
  beneficios: Benefit[];
}

export interface KonsiApiResponse<T = BenefitDataResponse> {
  success: boolean;
  data: T;
}

export interface KonsiTokenResponse {
  token: string;
  expiresIn: string; // Format: "2024-11-25 12:35:58"
}

export type TokenResponse = KonsiApiResponse<KonsiTokenResponse>;
