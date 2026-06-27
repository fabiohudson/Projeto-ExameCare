import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  async buscarPorEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async criar(dados: {
    nome: string;
    email: string;
    senhaHash: string;
    aceitouLgpd: boolean;
  }) {
    return this.prisma.usuario.create({
      data: dados,
    });
  }

  async salvarTokenRecuperacao(
  email: string,
  token: string,
  expira: Date,
) {
  return this.prisma.usuario.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpira: expira,
    },
  });
}

  async buscarPorResetToken(token: string) {
    return this.prisma.usuario.findFirst({
      where: {
        resetToken: token,
      },
    });
  }

  async atualizarSenha(
    usuarioId: number,
    senhaHash: string,
  ) {
    return this.prisma.usuario.update({
      where: {
        id: usuarioId,
      },
      data: {
        senhaHash,
        resetToken: null,
        resetTokenExpira: null,
      },
    });
  }
}