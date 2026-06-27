import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdatePerfilDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  fotoPerfil?: string;

  @IsOptional()
  @IsString()
  tema?: string;

  @IsOptional()
  @IsString()
  corTema?: string;

  @IsOptional()
  @IsInt()
  @Min(12)
  @Max(24)
  tamanhoFonte?: number;
}