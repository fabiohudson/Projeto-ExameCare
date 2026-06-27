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

import { ExameService } from './exame.service';
import { CreateExameDto } from './dto/create-exame.dto';
import { UpdateExameDto } from './dto/update-exame.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exames')
@UseGuards(JwtAuthGuard)
export class ExameController {
  constructor(private readonly exameService: ExameService) {}

  @Post()
  create(@Body() dto: CreateExameDto, @Req() req: any) {
    const usuario = req.user;

    return this.exameService.create(dto, usuario.id);
  }

  @Get()
  findAll(@Req() req: any) {
    const usuario = req.user;

    return this.exameService.findAll(usuario.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const usuario = req.user;

    return this.exameService.findOne(Number(id), usuario.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExameDto,
    @Req() req: any,
  ) {
    const usuario = req.user;

    return this.exameService.update(Number(id), dto, usuario.id);
  }

  @Patch(':id/realizar')
  realizar(@Param('id') id: string, @Req() req: any) {
    const usuario = req.user;

    return this.exameService.marcarRealizado(
      Number(id),
      usuario.id,
    );
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string, @Req() req: any) {
    const usuario = req.user;

    return this.exameService.cancelar(Number(id), usuario.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const usuario = req.user;

    return this.exameService.remove(Number(id), usuario.id);
  }
}