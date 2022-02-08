import { Test, TestingModule } from '@nestjs/testing';
import { BuildsController } from './builds.controller';
import { BuildsService } from './builds.service';
import { TasksService } from '../tasks/tasks.service';

describe('BuildsController', () => {
  let controller: BuildsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuildsController],
      providers: [
        { provide: BuildsService, useValue: jest.fn() },
        { provide: TasksService, useValue: jest.fn() },
      ],
    }).compile();

    controller = module.get<BuildsController>(BuildsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
