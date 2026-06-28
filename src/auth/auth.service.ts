import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { randomBytes } from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const usuarioExistente =
      await this.usuarioService.buscarPorEmail(dto.email);

    if (usuarioExistente) {
      throw new BadRequestException('E-mail ja cadastrado');
    }

    if (!dto.aceitouLgpd) {
      throw new BadRequestException(
        'E obrigatorio aceitar a LGPD',
      );
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.usuarioService.criar({
      nome: dto.nome,
      email: dto.email,
      senhaHash,
      aceitouLgpd: dto.aceitouLgpd,
    });

    const { senhaHash: _, ...usuarioSemSenha } = usuario;

    return usuarioSemSenha;
  }

  async login(dto: LoginDto) {
    const usuario =
      await this.usuarioService.buscarPorEmail(dto.email);

    if (!usuario) {
      throw new UnauthorizedException(
        'Credenciais invalidas',
      );
    }

    const senhaValida = await bcrypt.compare(
      dto.senha,
      usuario.senhaHash,
    );

    if (!senhaValida) {
      throw new UnauthorizedException(
        'Credenciais invalidas',
      );
    }

    const token = this.jwtService.sign({
      sub: usuario.id,
      email: usuario.email,
    });

    return {
      access_token: token,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const usuario =
      await this.usuarioService.buscarPorEmail(dto.email);

    if (usuario) {
      const token = randomBytes(32).toString('hex');
      const expira = new Date();
      expira.setMinutes(expira.getMinutes() + 30);

      await this.usuarioService.salvarTokenRecuperacao(
        usuario.email,
        token,
        expira,
      );
    }

    return {
      message:
        'Se o e-mail estiver cadastrado, as instruções de recuperação serão enviadas.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const usuario =
      await this.usuarioService.buscarPorResetToken(dto.token);

    if (!usuario) {
      throw new BadRequestException(
        'Codigo de recuperacao invalido',
      );
    }

    if (
      !usuario.resetTokenExpira ||
      usuario.resetTokenExpira < new Date()
    ) {
      throw new BadRequestException(
        'Codigo de recuperacao expirado',
      );
    }

    const senhaHash = await bcrypt.hash(dto.novaSenha, 10);

    await this.usuarioService.atualizarSenha(
      usuario.id,
      senhaHash,
    );

    return {
      message: 'Senha redefinida com sucesso.',
    };
  }
}
