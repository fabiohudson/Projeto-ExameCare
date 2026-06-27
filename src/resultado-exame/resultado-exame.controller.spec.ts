import { Test, TestingModule } from '@nestjs/testing';
import { ResultadoExameController } from './resultado-exame.controller';

describe('ResultadoExameController', () => {
  let controller: ResultadoExameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultadoExameController],
    }).compile();

    controller = module.get<ResultadoExameController>(ResultadoExameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
