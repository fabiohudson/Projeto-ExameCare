import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateIdosoDto {
  @IsNotEmpty()
  nome: string;

  @IsNotEmpty()
  cpf: string;

  @IsDateString()
  dataNascimento: string;

  @IsNotEmpty()
  sexo: string;

  @IsOptional()
  telefone?: string;

  @IsOptional()
  observacoes?: string;
}