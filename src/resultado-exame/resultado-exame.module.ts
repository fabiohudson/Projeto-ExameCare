import { Module } from '@nestjs/common';
import { ResultadoExameController } from './resultado-exame.controller';
import { ResultadoExameService } from './resultado-exame.service';

@Module({
  controllers: [ResultadoExameController],
  providers: [ResultadoExameService]
})
export class ResultadoExameModule {}
