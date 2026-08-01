import { Test, TestingModule } from '@nestjs/testing';
import { StatutController } from './statut.controller';

describe('StatutController', () => {
  let controller: StatutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatutController],
    }).compile();

    controller = module.get<StatutController>(StatutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
