import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { INestApplication } from '@nestjs/common';
import { RunsController } from './runs.controller';
import { TestDtoUtils } from '../utils/test-dto-utils';
import { CreateTasksDto, SetLeaderResponseDto, StartTaskResponseDto } from '@tskmgr/common';
import { uniq } from 'lodash';
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
      const uniqIds = uniq(ids);
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

  it('affinity', async () => {
    // arrange
    const affinityId = `affinity-id-${TestDtoUtils.getShortId(16)}`;
    const runnerId = 'AFFINITY_RUNNER_01';
    const createTasks: CreateTasksDto = {
      tasks: [{ name: 'name1', type: 'type1', command: 'command1', arguments: ['a1', 'a2'] }],
    };

    // create 1st run
    const run1 = await runsController.createRun({
      name: `run1-${affinityId}`,
      type: 'test',
      url: 'http://affinity-run',
      affinity: true,
      info: {
        url1: 'http://url1',
        url2: 'http://url2',
      },
      parameters: {
        affinityId,
      },
    });
    const createdTasksRun1 = await runsController.createTasks(run1.id, createTasks);
    const startedTaskRun1 = await runsController.startTask(run1.id, { runnerId });
    const completedTaskRun1 = await tasksController.complete(startedTaskRun1.task.id, { cached: false });

    // act
    const run2 = await runsController.createRun({
      name: `run2-${affinityId}`,
      type: 'test',
      affinity: true,
      parameters: {
        affinityId,
      },
    });
    const createdTasksRun2 = await runsController.createTasks(run2.id, createTasks);
    const startedTaskRun2 = await runsController.startTask(run2.id, { runnerId });

    // assert
    expect(createdTasksRun2[0].runnerId).toEqual(runnerId);
    expect(startedTaskRun2.task.type).toEqual(completedTaskRun1.type);
    expect(startedTaskRun2.task.command).toEqual(completedTaskRun1.command);
    expect(startedTaskRun2.task.arguments).toEqual(completedTaskRun1.arguments);
    expect(startedTaskRun2.task.options).toEqual(completedTaskRun1.options);
  });
});
