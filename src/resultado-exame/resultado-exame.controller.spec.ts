import { Test, TestingModule } from '@nestjs/testing';
import { ResultadoExameController } from './resultado-exame.controller';
import { ResultadoExameService } from './resultado-exame.service';

describe('ResultadoExameController', () => {
  let controller: ResultadoExameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultadoExameController],
      providers: [
        {
          provide: ResultadoExameService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ResultadoExameController>(ResultadoExameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
