import { Test, TestingModule } from '@nestjs/testing';
import { ExameService } from './exame.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExameService', () => {
  let service: ExameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExameService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ExameService>(ExameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
