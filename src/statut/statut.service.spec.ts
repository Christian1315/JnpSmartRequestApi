import { Test, TestingModule } from '@nestjs/testing';
import { StatutService } from './statut.service';

describe('StatutService', () => {
  let service: StatutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatutService],
    }).compile();

    service = module.get<StatutService>(StatutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
