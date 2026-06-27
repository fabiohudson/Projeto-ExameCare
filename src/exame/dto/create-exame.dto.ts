import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateExameDto {
  @IsDateString()
  data: string;

  @IsNotEmpty()
  local: string;

  @IsNotEmpty()
  tipo: string;

  @IsNotEmpty()
  especialidade: string;

  @IsOptional()
  observacoes?: string;

  @IsNotEmpty()
  idosoId: number;
}