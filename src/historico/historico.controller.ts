import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { HistoricoService } from './historico.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('historico')
@UseGuards(JwtAuthGuard)
export class HistoricoController {
  constructor(private readonly historicoService: HistoricoService) {}

  @Get(':idosoId')
  buscarPorIdoso(
    @Param('idosoId') idosoId: string,
    @Req() req: any,
  ) {
    const usuario = req.user;

    return this.historicoService.buscarPorIdoso(
      Number(idosoId),
      usuario.id,
    );
  }
}
