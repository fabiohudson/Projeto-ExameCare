import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';

@Injectable()
export class ConsultaService {
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

  async create(dto: CreateConsultaDto, usuarioId: number) {
    await this.validarIdosoDoUsuario(dto.idosoId, usuarioId);

    const dataConsulta = new Date(dto.data);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataConsulta < hoje) {
      throw new BadRequestException(
        'Não é permitido agendar consultas em datas passadas',
      );
    }

    return this.prisma.consulta.create({
      data: {
        ...dto,
        data: dataConsulta,
      },
    });
  }

  findAll(usuarioId: number) {
    return this.prisma.consulta.findMany({
      where: {
        idoso: {
          usuarioId,
        },
      },
      include: {
        idoso: true,
      },
    });
  }

  findOne(id: number, usuarioId: number) {
    return this.prisma.consulta.findFirst({
      where: {
        id,
        idoso: {
          usuarioId,
        },
      },
      include: {
        idoso: true,
      },
    });
  }

  async update(
    id: number,
    dto: UpdateConsultaDto,
    usuarioId: number,
  ) {
    const consulta = await this.prisma.consulta.findFirst({
      where: {
        id,
        idoso: {
          usuarioId,
        },
      },
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    if (consulta.status === 'REALIZADA') {
      throw new BadRequestException(
        'Consultas realizadas não podem ser editadas',
      );
    }

    return this.prisma.consulta.update({
      where: { id },
      data: {
        ...dto,
        data: dto.data ? new Date(dto.data) : undefined,
      },
    });
  }

  async remove(id: number, usuarioId: number) {
    const consulta = await this.prisma.consulta.findFirst({
      where: {
        id,
        idoso: {
          usuarioId,
        },
      },
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    return this.prisma.consulta.delete({
      where: { id },
    });
  }

  async cancelar(id: number, usuarioId: number) {
    const consulta = await this.prisma.consulta.findFirst({
      where: {
        id,
        idoso: {
          usuarioId,
        },
      },
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    if (consulta.status !== 'AGENDADA') {
      throw new BadRequestException(
        'Apenas consultas agendadas podem ser canceladas',
      );
    }

    return this.prisma.consulta.update({
      where: { id },
      data: {
        status: 'CANCELADA',
      },
    });
  }

  async realizar(id: number, usuarioId: number) {
    const consulta = await this.prisma.consulta.findFirst({
      where: {
        id,
        idoso: {
          usuarioId,
        },
      },
    });

    if (!consulta) {
      throw new NotFoundException('Consulta não encontrada');
    }

    if (consulta.status !== 'AGENDADA') {
      throw new BadRequestException(
        'Apenas consultas agendadas podem ser realizadas',
      );
    }

    return this.prisma.consulta.update({
      where: { id },
      data: {
        status: 'REALIZADA',
      },
    });
  }
}