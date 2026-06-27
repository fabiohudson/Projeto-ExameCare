import { Module } from '@nestjs/common';
import { IdosoController } from './idoso.controller';
import { IdosoService } from './idoso.service';

@Module({
  controllers: [IdosoController],
  providers: [IdosoService]
})
export class IdosoModule {}
