import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { INestApplication } from '@nestjs/common';
import { RunsController } from './runs.controller';
import { TestDtoUtils } from '../utils/test-dto-utils';
import { SetLeaderResponseDto, StartTaskResponseDto } from '@tskmgr/common';
import { TasksController } from '../tasks/tasks.controller';

describe('RunsController', () => {
  let app: INestApplication;

  let runsController: RunsController;
  let tasksController: TasksController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    runsController = moduleRef.get(RunsController);
    tasksController = moduleRef.get(TasksController);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('concurrency', () => {
    it('should start unique tasks', async () => {
      // arrange
      const parallel = 10;
      const run = await runsController.createRun(TestDtoUtils.createRunDto());
      const tasks = await runsController.createTasks(run.id, TestDtoUtils.createTasksDto(parallel));
      await runsController.closeRun(run.id);
      expect(tasks).toHaveLength(parallel);

      // act
      const promises: Promise<StartTaskResponseDto>[] = [];
      tasks.forEach((x, i) => {
        promises.push(runsController.startTask(run.id, { runnerId: `RUNNER_${i}` }));
      });
      const res = await Promise.all(promises);

      // assert
      const ids = res.map((x) => x.task.id);
      const uniqIds = [...new Set(ids)];
      expect(uniqIds).toHaveLength(parallel);
    });

    it('should only elect one leader', async () => {
      // arrange
      const parallel = 10;
      const run = await runsController.createRun(TestDtoUtils.createRunDto());

      // act
      const promises: Promise<SetLeaderResponseDto>[] = [];
      for (let i = 0; i < parallel; i++) {
        promises.push(runsController.setLeader(run.id, { runnerId: `RUNNER_${i}` }));
      }
      const res = await Promise.all(promises);

      // assert
      const leaders = res.filter((x) => x.leader === true);
      expect(leaders).toHaveLength(1);
    });
  });
});
