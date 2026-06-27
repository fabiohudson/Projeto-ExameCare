import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(usuarioId: number) {
    const hoje = new Date();

    const daqui7Dias = new Date();
    daqui7Dias.setDate(hoje.getDate() + 7);

    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },
      select: {
        id: true,
        nome: true,
      },
    });

    const idosos = await this.prisma.idoso.count({
      where: {
        usuarioId,
      },
    });

    const examesProximos = await this.prisma.exame.count({
      where: {
        status: 'AGENDADO',
        data: {
          gte: hoje,
          lte: daqui7Dias,
        },
        idoso: {
          usuarioId,
        },
      },
    });

    const consultasProximas = await this.prisma.consulta.count({
      where: {
        status: 'AGENDADA',
        data: {
          gte: hoje,
          lte: daqui7Dias,
        },
        idoso: {
          usuarioId,
        },
      },
    });

    const examesSemResultado = await this.prisma.exame.count({
      where: {
        status: 'REALIZADO',
        resultado: null,
        idoso: {
          usuarioId,
        },
      },
    });

    const examesHoje = await this.prisma.exame.count({
      where: {
        status: 'AGENDADO',
        data: {
          gte: hoje,
        },
        idoso: {
          usuarioId,
        },
      },
    });

    const consultasHoje = await this.prisma.consulta.count({
      where: {
        status: 'AGENDADA',
        data: {
          gte: hoje,
        },
        idoso: {
          usuarioId,
        },
      },
    });

    return {
      usuario,
      idosos,
      examesHoje,
      consultasHoje,
      notificacoes: {
        examesProximos,
        consultasProximas,
        examesSemResultado,
        total:
          examesProximos +
          consultasProximas +
          examesSemResultado,
      },
    };
  }
}