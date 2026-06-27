import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

@Injectable()
export class PerfilService {
  constructor(private prisma: PrismaService) {}

  buscarPerfil(usuarioId: number) {
    return this.prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        fotoPerfil: true,
        tema: true,
        corTema: true,
        tamanhoFonte: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  atualizarPerfil(usuarioId: number, dto: UpdatePerfilDto) {
    return this.prisma.usuario.update({
      where: {
        id: usuarioId,
      },
      data: dto,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        fotoPerfil: true,
        tema: true,
        corTema: true,
        tamanhoFonte: true,
        updatedAt: true,
      },
    });
  }
}