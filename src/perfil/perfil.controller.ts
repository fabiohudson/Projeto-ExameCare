import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { PerfilService } from './perfil.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('perfil')
@UseGuards(JwtAuthGuard)
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Get()
  buscarPerfil(@Req() req: any) {
    return this.perfilService.buscarPerfil(req.user.id);
  }

  @Patch()
  atualizarPerfil(
    @Req() req: any,
    @Body() dto: UpdatePerfilDto,
  ) {
    return this.perfilService.atualizarPerfil(req.user.id, dto);
  }
}