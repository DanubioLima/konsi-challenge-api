interface KonsiApiResponse<T> {
  success: boolean;
  data: T;
}

interface KonsiTokenResponse {
  token: string;
  expiresIn: string;
}

export type TokenResponse = KonsiApiResponse<KonsiTokenResponse>;

export interface Benefit {
  numero_beneficio: string;
  codigo_tipo_beneficio: string;
}

export interface BenefitDataResponse {
  cpf: string;
  beneficios: Benefit[];
}
