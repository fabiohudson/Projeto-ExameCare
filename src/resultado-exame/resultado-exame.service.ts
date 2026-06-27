import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateResultadoDto } from './dto/create-resultado.dto';

@Injectable()
export class ResultadoExameService {
  constructor(private prisma: PrismaService) {}

  async registrar(
    exameId: number,
    dto: CreateResultadoDto,
    usuarioId: number,
  ) {
    const exame = await this.prisma.exame.findFirst({
      where: {
        id: exameId,
        idoso: {
          usuarioId,
        },
      },
      include: {
        resultado: true,
      },
    });

    if (!exame) {
      throw new NotFoundException('Exame não encontrado');
    }

    if (exame.status !== 'REALIZADO') {
      throw new BadRequestException(
        'Somente exames realizados podem receber resultado',
      );
    }

    if (exame.resultado) {
      throw new BadRequestException(
        'Resultado já cadastrado para este exame',
      );
    }

    return this.prisma.resultadoExame.create({
      data: {
        nomeResultado: dto.nomeResultado,
        arquivoUrl: dto.arquivoUrl,
        resumo: dto.resumo,
        exameId,
      },
    });
  }
}