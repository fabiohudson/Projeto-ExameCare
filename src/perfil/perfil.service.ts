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
        endereco: true,
        alergias: true,
        observacoesImportantes: true,
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
      data: {
        nome: dto.nome,
        telefone: dto.telefone,
        endereco: dto.endereco,
        alergias: dto.alergias,
        observacoesImportantes:
          dto.observacoesImportantes,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        endereco: true,
        alergias: true,
        observacoesImportantes: true,
        updatedAt: true,
      },
    });
  }
}
