import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ConsultaService } from './consulta.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('consultas')
@UseGuards(JwtAuthGuard)
export class ConsultaController {
  constructor(private readonly consultaService: ConsultaService) {}

  @Post()
  create(@Body() dto: CreateConsultaDto, @Req() req: any) {
    const usuario = req.user;
    return this.consultaService.create(dto, usuario.id);
  }

  @Get()
  findAll(@Req() req: any) {
    const usuario = req.user;
    return this.consultaService.findAll(usuario.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const usuario = req.user;
    return this.consultaService.findOne(Number(id), usuario.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateConsultaDto,
    @Req() req: any,
  ) {
    const usuario = req.user;
    return this.consultaService.update(Number(id), dto, usuario.id);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string, @Req() req: any) {
    const usuario = req.user;
    return this.consultaService.cancelar(Number(id), usuario.id);
  }

  @Patch(':id/realizar')
  realizar(@Param('id') id: string, @Req() req: any) {
    const usuario = req.user;
    return this.consultaService.realizar(Number(id), usuario.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const usuario = req.user;
    return this.consultaService.remove(Number(id), usuario.id);
  }
}