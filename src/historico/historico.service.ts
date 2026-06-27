import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoricoService {
  constructor(private prisma: PrismaService) {}

  async buscarPorIdoso(idosoId: number, usuarioId: number) {
    const idoso = await this.prisma.idoso.findFirst({
      where: {
        id: idosoId,
        usuarioId,
      },
      include: {
        exames: {
          include: {
            resultado: true,
          },
          orderBy: {
            data: 'desc',
          },
        },
        consultas: {
          orderBy: {
            data: 'desc',
          },
        },
      },
    });

    if (!idoso) {
      throw new NotFoundException('Histórico não encontrado');
    }

    return idoso;
  }
}
