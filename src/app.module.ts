import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { IdosoModule } from './idoso/idoso.module';
import { ExameModule } from './exame/exame.module';
import { ConsultaModule } from './consulta/consulta.module';
import { ResultadoExameModule } from './resultado-exame/resultado-exame.module';
import { HistoricoModule } from './historico/historico.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PerfilModule } from './perfil/perfil.module';

@Module({
  imports: [PrismaModule, AuthModule, UsuarioModule, IdosoModule, ExameModule, ConsultaModule, ResultadoExameModule, HistoricoModule, DashboardModule, PerfilModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
