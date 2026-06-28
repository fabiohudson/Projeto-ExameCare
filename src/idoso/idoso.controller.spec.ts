import { Test, TestingModule } from '@nestjs/testing';
import { IdosoController } from './idoso.controller';
import { IdosoService } from './idoso.service';

describe('IdosoController', () => {
  let controller: IdosoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdosoController],
      providers: [
        {
          provide: IdosoService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<IdosoController>(IdosoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
