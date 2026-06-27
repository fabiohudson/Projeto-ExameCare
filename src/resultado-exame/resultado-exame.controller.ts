import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ResultadoExameService } from './resultado-exame.service';
import { CreateResultadoDto } from './dto/create-resultado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resultados')
@UseGuards(JwtAuthGuard)
export class ResultadoExameController {
  constructor(
    private readonly service: ResultadoExameService,
  ) {}

  @Post(':exameId')
  registrar(
    @Param('exameId') exameId: string,
    @Body() dto: CreateResultadoDto,
    @Req() req: any,
  ) {
    const usuario = req.user;

    return this.service.registrar(
      Number(exameId),
      dto,
      usuario.id,
    );
  }
}