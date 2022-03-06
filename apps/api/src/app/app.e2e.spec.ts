import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { v4 as uuid } from 'uuid';
import { Run } from './runs/schemas/run.schema';
import { Task } from './tasks/schemas/task.schema';
import { ApiUrl, RunStatus, CreateRunRequestDto, CreateTasksDto, StartTaskDto, StartTaskResponseDto, TaskStatus } from '@tskmgr/common';

describe('Runs', () => {
  let app: INestApplication;

  let createRunDto: CreateRunRequestDto;
  let createTasksDto: CreateTasksDto;
  let startTaskDto: StartTaskDto;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    const uniqueId = uuid();
    createRunDto = {
      name: `test-project-${uniqueId}`,
      url: `https://circleci.com/${uniqueId}/`,
      type: 'test-type',
      pullRequestName: `test-pr-${uniqueId}`,
      pullRequestUrl: `https://github.com/${uniqueId}/`,
    };
    createTasksDto = {
      tasks: [{ name: 'test-app', command: 'nx', type: 'lint' }],
    };
    startTaskDto = { runnerId: '1' };
  });

  it(`should create run`, async () => {
    // arrange
    // act
    const res = await createRun(app, createRunDto);
    const data: Run = res.body;
    // assert
    expect(res.status).toEqual(201);
    expect(data.status).toEqual(RunStatus.Created);
    expect(data.type).toEqual(createRunDto.type);
    expect(data.pullRequest.name).toEqual(createRunDto.pullRequestName);
    expect(data.pullRequest.url).toEqual(createRunDto.pullRequestUrl);
    expect(data.name).toEqual(createRunDto.name);
    expect(data.url).toEqual(createRunDto.url);
    expect(new Date(res.body.createdAt)).not.toBeNaN();
  });

  it('should create tasks', async () => {
    // arrange
    const run: Run = (await createRun(app, createRunDto)).body;
    // act
    const tasks: Task[] = (await createTasks(app, run._id, createTasksDto).expect(201)).body;
    // assert
    expect(tasks.length).toBe(1);
    expect(tasks[0].status).toEqual(TaskStatus.Pending);
    expect(tasks[0].createdAt).toBeTruthy();
  });

  it('should start task', async () => {
    // arrange
    const run: Run = (await createRun(app, createRunDto)).body;
    const tasks: Task[] = (await createTasks(app, run._id, createTasksDto)).body;
    // act
    const res = await startTask(app, run._id, startTaskDto);
    const data: StartTaskResponseDto = res.body;
    // expect
    expect(res.status).toEqual(200);
    expect(data.continue).toEqual(true);
    expect(data.task).toBeTruthy();
    expect(data.task.status).toEqual(TaskStatus.Started);
    expect(data.task.startedAt).toBeTruthy();
  });

  it('should complete task', async () => {
    // arrange
    const run: Run = (await createRun(app, createRunDto)).body;
    const tasks: Task[] = (await createTasks(app, run._id, createTasksDto)).body;
    const startedTask: StartTaskResponseDto = (await startTask(app, run._id, startTaskDto)).body;
    // act
    const data: Task = (await completeTask(app, startedTask.task._id).expect(200)).body;
    // expect
    expect(data.status).toEqual(TaskStatus.Completed);
    expect(data.endedAt).toBeTruthy();
    expect(data.duration).toBeTruthy();
    expect(data.run.status).toEqual(RunStatus.Started);
  });

  describe('one task has failed', () => {
    let run: Run;
    let tasks: Task[];
    let startedTask: StartTaskResponseDto;
    let failedTask: Task;

    beforeEach(async () => {
      // arrange
      run = (await createRun(app, createRunDto)).body;
      tasks = (await createTasks(app, run._id, createTasksDto)).body;
      startedTask = (await startTask(app, run._id, startTaskDto)).body;
      failedTask = (await failTask(app, startedTask.task._id).expect(200)).body;
    });

    it('should fail task', () => {
      // expect
      expect(failedTask.status).toEqual(TaskStatus.Failed);
      expect(failedTask.endedAt).toBeTruthy();
      expect(failedTask.duration).toBeTruthy();
    });

    it('should abort run', () => {
      expect(failedTask.run.status).toEqual(RunStatus.Aborted);
    });

    it('should not continue', async () => {
      // act
      const data: StartTaskResponseDto = (await startTask(app, run._id, startTaskDto).expect(200)).body;
      // expect
      expect(data.continue).toBe(false);
    });

    it('should not create new tasks', async () => {
      // act
      const res = await createTasks(app, run._id, createTasksDto).expect(500);
      // expect
      expect(res.body.reason).toEqual("Run with ABORTED status can't accept new tasks");
    });
  });

  describe('run has been closed', () => {
    let run: Run;
    let tasks: Task[];
    let startedTask: StartTaskResponseDto;
    let closedRun: Run;

    beforeEach(async () => {
      // arrange
      run = (await createRun(app, createRunDto)).body;
      tasks = (await createTasks(app, run._id, createTasksDto)).body;
      startedTask = (await startTask(app, run._id, startTaskDto)).body;
      closedRun = (await closeRun(app, run._id)).body;
    });

    it('should close run', () => {
      // expect
      expect(closedRun.status).toEqual(RunStatus.Closed);
    });

    it('should complete run when task complete', async () => {
      // act
      const task: Task = (await completeTask(app, startedTask.task._id).expect(200)).body;
      // expect
      expect(task.run.status).toEqual(RunStatus.Completed);
    });

    it('should not create new task', async () => {
      // act
      const res = await createTasks(app, run._id, createTasksDto).expect(500);
      // expect
      expect(res.body.reason).toEqual("Run with CLOSED status can't accept new tasks");
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

function createRun(app: INestApplication, data: CreateRunRequestDto): request.Test {
  return request(app.getHttpServer()).post(ApiUrl.createNoPrefix().createRunUrl()).send(data);
}

function closeRun(app: INestApplication, runId: any): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().closeRunUrl(runId));
}

function createTasks(app: INestApplication, runId: any, data: CreateTasksDto): request.Test {
  return request(app.getHttpServer()).post(ApiUrl.createNoPrefix().createTasksUrl(runId)).send(data);
}

function startTask(app: INestApplication, runId: any, data: StartTaskDto): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().startTaskUrl(runId)).send(data);
}

function completeTask(app: INestApplication, taskId: any): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().completeTaskUrl(taskId));
}

function failTask(app: INestApplication, taskId: any): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().failTaskUrl(taskId));
}
