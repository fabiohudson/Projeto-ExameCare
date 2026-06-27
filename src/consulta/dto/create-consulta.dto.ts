import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateConsultaDto {
  @IsNotEmpty()
  medico: string;

  @IsNotEmpty()
  especialidade: string;

  @IsDateString()
  data: string;

  @IsNotEmpty()
  local: string;

  @IsNotEmpty()
  idosoId: number;
}