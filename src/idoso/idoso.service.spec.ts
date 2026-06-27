import { Test, TestingModule } from '@nestjs/testing';
import { IdosoService } from './idoso.service';

describe('IdosoService', () => {
  let service: IdosoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdosoService],
    }).compile();

    service = module.get<IdosoService>(IdosoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
