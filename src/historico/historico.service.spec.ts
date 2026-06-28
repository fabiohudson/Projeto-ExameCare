import { Test, TestingModule } from '@nestjs/testing';
import { HistoricoService } from './historico.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HistoricoService', () => {
  let service: HistoricoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoricoService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<HistoricoService>(HistoricoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
