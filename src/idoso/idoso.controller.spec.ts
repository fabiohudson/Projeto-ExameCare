import { Test, TestingModule } from '@nestjs/testing';
import { IdosoController } from './idoso.controller';

describe('IdosoController', () => {
  let controller: IdosoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdosoController],
    }).compile();

    controller = module.get<IdosoController>(IdosoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
