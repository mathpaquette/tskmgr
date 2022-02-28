import { Test, TestingModule } from '@nestjs/testing';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';
import { TasksService } from '../tasks/tasks.service';

describe('RunsController', () => {
  let controller: RunsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RunsController],
      providers: [
        { provide: RunsService, useValue: jest.fn() },
        { provide: TasksService, useValue: jest.fn() },
      ],
    }).compile();

    controller = module.get<RunsController>(RunsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
