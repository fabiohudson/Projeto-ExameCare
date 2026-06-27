import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello(): Promise<string> {
    const usuarios = await this.prisma.usuario.count();

    return `Conexão OK! Usuários cadastrados: ${usuarios}`;
  }
}