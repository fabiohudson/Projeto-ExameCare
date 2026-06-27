import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  senha: string;

  @IsBoolean()
  aceitouLgpd: boolean;
}