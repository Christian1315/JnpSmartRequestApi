import { Test, TestingModule } from '@nestjs/testing';
import { AttachementController } from './attachement.controller';

describe('AttachementController', () => {
  let controller: AttachementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttachementController],
    }).compile();

    controller = module.get<AttachementController>(AttachementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
