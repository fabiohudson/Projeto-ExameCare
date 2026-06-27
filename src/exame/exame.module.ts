import { Module } from '@nestjs/common';
import { ExameController } from './exame.controller';
import { ExameService } from './exame.service';

@Module({
  controllers: [ExameController],
  providers: [ExameService]
})
export class ExameModule {}
