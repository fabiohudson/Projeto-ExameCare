import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIdosoDto } from './dto/create-idoso.dto';
import { UpdateIdosoDto } from './dto/update-idoso.dto';

@Injectable()
export class IdosoService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateIdosoDto, usuarioId: number) {
    return this.prisma.idoso.create({
      data: {
        ...dto,
        dataNascimento: new Date(dto.dataNascimento),
        usuarioId,
      },
    });
  }

  findAll(usuarioId: number) {
    return this.prisma.idoso.findMany({
      where: {
        usuarioId,
      },
      include: {
        exames: true,
        consultas: true,
      },
    });
  }

  findOne(id: number, usuarioId: number) {
    return this.prisma.idoso.findFirst({
      where: {
        id,
        usuarioId,
      },
      include: {
        exames: true,
        consultas: true,
      },
    });
  }

  update(
    id: number,
    dto: UpdateIdosoDto,
    usuarioId: number,
  ) {
    return this.prisma.idoso.updateMany({
      where: {
        id,
        usuarioId,
      },
      data: {
        ...dto,
        dataNascimento: dto.dataNascimento
          ? new Date(dto.dataNascimento)
          : undefined,
      },
    });
  }

  remove(id: number, usuarioId: number) {
    return this.prisma.idoso.deleteMany({
      where: {
        id,
        usuarioId,
      },
    });
  }
}