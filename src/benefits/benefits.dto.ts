import { Length } from 'class-validator';

export class CpfParams {
  @Length(11, 14)
  cpf: string;
}
