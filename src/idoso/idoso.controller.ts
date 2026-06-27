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

import { IdosoService } from './idoso.service';
import { CreateIdosoDto } from './dto/create-idoso.dto';
import { UpdateIdosoDto } from './dto/update-idoso.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('idosos')
@UseGuards(JwtAuthGuard)
export class IdosoController {
  constructor(private readonly idosoService: IdosoService) {}

  @Post()
  create(@Body() dto: CreateIdosoDto, @Req() req: any) {
    const usuario = req.user;

    return this.idosoService.create(dto, usuario.id);
  }

  @Get()
  findAll(@Req() req: any) {
    const usuario = req.user;

    return this.idosoService.findAll(usuario.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const usuario = req.user;

    return this.idosoService.findOne(Number(id), usuario.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateIdosoDto,
    @Req() req: any,
  ) {
    const usuario = req.user;

    return this.idosoService.update(Number(id), dto, usuario.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const usuario = req.user;

    return this.idosoService.remove(Number(id), usuario.id);
  }
}