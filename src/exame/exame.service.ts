import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateExameDto } from './dto/create-exame.dto';
import { UpdateExameDto } from './dto/update-exame.dto';

@Injectable()
export class ExameService {
  constructor(private prisma: PrismaService) {}

  private async validarIdosoDoUsuario(
    idosoId: number,
    usuarioId: number,
  ) {
    const idoso = await this.prisma.idoso.findFirst({
      where: {
        id: idosoId,
        usuarioId,
      },
    });

    if (!idoso) {
      throw new BadRequestException(
        'Idoso não encontrado para este usuário',
      );
    }

    return idoso;
  }

  async create(dto: CreateExameDto, usuarioId: number) {
    await this.validarIdosoDoUsuario(dto.idosoId, usuarioId);

    const dataExame = new Date(dto.data);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataExame < hoje) {
      throw new BadRequestException(
        'Não é permitido agendar exames em datas passadas',
      );
    }

    return this.prisma.exame.create({
      data: {
        ...dto,
        data: dataExame,
      },
    });
  }

  findAll(usuarioId: number) {
    return this.prisma.exame.findMany({
      where: {
        idoso: {
          usuarioId,
        },
      },
      include: {
        idoso: true,
        resultado: true,
      },
    });
  }

  findOne(id: number, usuarioId: number) {
    return this.prisma.exame.findFirst({
      where: {
        id,
        idoso: {
          usuarioId,
        },
      },
      include: {
        idoso: true,
        resultado: true,
      },
    });
  }

  async update(
    id: number,
    dto: UpdateExameDto,
    usuarioId: number,
  ) {
    const exame = await this.prisma.exame.findFirst({
      where: {
        id,
        idoso: {
          usuarioId,
        },
      },
    });

    if (!exame) {
      throw new NotFoundException('Exame não encontrado');
    }

    if (exame.status === 'REALIZADO') {
      throw new BadRequestException(
        'Exames realizados não podem ser editados',
      );
    }

    return this.prisma.exame.update({
      where: { id },
      data: {
        ...dto,
        data: dto.data ? new Date(dto.data) : undefined,
      },
    });
  }

  async remove(id: number, usuarioId: number) {
    const exame = await this.prisma.exame.findFirst({
      where: {
        id,
        idoso: {
          usuarioId,
        },
      },
    });

    if (!exame) {
      throw new NotFoundException('Exame não encontrado');
    }

    return this.prisma.exame.delete({
      where: { id },
    });
  }

  async marcarRealizado(id: number, usuarioId: number) {
    const exame = await this.prisma.exame.findFirst({
      where: {
        id,
        idoso: {
          usuarioId,
        },
      },
    });

    if (!exame) {
      throw new NotFoundException('Exame não encontrado');
    }

    if (exame.status !== 'AGENDADO') {
      throw new BadRequestException(
        'Apenas exames agendados podem ser realizados',
      );
    }

    return this.prisma.exame.update({
      where: { id },
      data: {
        status: 'REALIZADO',
      },
    });
  }

  async cancelar(id: number, usuarioId: number) {
    const exame = await this.prisma.exame.findFirst({
      where: {
        id,
        idoso: {
          usuarioId,
        },
      },
    });

    if (!exame) {
      throw new NotFoundException('Exame não encontrado');
    }

    if (exame.status !== 'AGENDADO') {
      throw new BadRequestException(
        'Apenas exames agendados podem ser cancelados',
      );
    }

    return this.prisma.exame.update({
      where: { id },
      data: {
        status: 'CANCELADO',
      },
    });
  }
}