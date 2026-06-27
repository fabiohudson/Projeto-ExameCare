import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateResultadoDto {
  @IsNotEmpty()
  nomeResultado: string;

  @IsOptional()
  arquivoUrl?: string;

  @IsOptional()
  resumo?: string;
}