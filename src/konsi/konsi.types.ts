export interface BenefitDataResponse {
  numero_beneficio: string;
  codigo_beneficio: string;
}

export interface KonsiApiResponse<T = BenefitDataResponse[]> {
  success: boolean;
  data: T;
}
