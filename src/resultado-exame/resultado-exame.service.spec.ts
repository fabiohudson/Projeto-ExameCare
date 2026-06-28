import { Test, TestingModule } from '@nestjs/testing';
import { ResultadoExameService } from './resultado-exame.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ResultadoExameService', () => {
  let service: ResultadoExameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultadoExameService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ResultadoExameService>(ResultadoExameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
