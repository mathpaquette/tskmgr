import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { CreateBuildDto } from './builds/dto/create-build.dto';
import { v4 as uuid } from 'uuid';
import { Build, BuildStatus } from './builds/schemas/build.schema';
import { CreateTasksDto } from './tasks/dto/create-tasks.dto';
import { Task, TaskStatus } from './tasks/schemas/task.schema';
import { StartTaskResponseDto } from './builds/dto/start-task-response.dto';
import { StartTaskDto } from './builds/dto/start-task.dto';

describe('Builds', () => {
  let app: INestApplication;

  let createBuildDto: CreateBuildDto;
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
    createBuildDto = {
      name: `test-${uuid()}`,
      type: 'test',
      pullRequestId: 'test-pr-100',
    };
    createTasksDto = {
      tasks: [
        { name: 'test-app', command: 'nx', type: 'lint' },
        // { name: 'test-app', command: 'nx', type: 'test' },
        // { name: 'test-app', command: 'nx', type: 'build' },
      ],
    };
    startTaskDto = { runnerId: '1' };
  });

  it(`should create build`, async () => {
    // arrange
    // act
    const res = await createBuild(app, createBuildDto);
    const data: Build = res.body;
    // assert
    expect(res.status).toEqual(201);
    expect(data.status).toEqual(BuildStatus.Created);
    expect(data.type).toEqual(createBuildDto.type);
    expect(data.pullRequest.name).toEqual(createBuildDto.pullRequestId);
    expect(data.name).toEqual(createBuildDto.name);
    expect(new Date(res.body.createdAt)).not.toBeNaN();
  });

  it('should create tasks', async () => {
    // arrange
    const build: Build = (await createBuild(app, createBuildDto)).body;
    // act
    const res = await createTasks(app, build._id, createTasksDto);
    const data: Task[] = res.body;
    // assert
    expect(res.status).toEqual(201);
    expect(data.length).toBe(1);
  });

  it('should start task', async () => {
    // arrange
    const build: Build = (await createBuild(app, createBuildDto)).body;
    const tasks: Task[] = (await createTasks(app, build._id, createTasksDto)).body;
    // act
    const res = await startTask(app, build._id, startTaskDto);
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
    const build: Build = (await createBuild(app, createBuildDto)).body;
    const tasks: Task[] = (await createTasks(app, build._id, createTasksDto)).body;
    const startedTask: StartTaskResponseDto = (await startTask(app, build._id, startTaskDto)).body;
    // act
    const data: Task = (await completeTask(app, startedTask.task._id).expect(200)).body;
    // expect
    expect(data.status).toEqual(TaskStatus.Completed);
    expect(data.endedAt).toBeTruthy();
    expect(data.duration).toBeTruthy();
    expect(data.build.status).toEqual(BuildStatus.Started);
  });

  describe('one task has failed', () => {
    let build: Build;
    let tasks: Task[];
    let startedTask: StartTaskResponseDto;
    let failedTask: Task;

    beforeEach(async () => {
      // arrange
      build = (await createBuild(app, createBuildDto)).body;
      tasks = (await createTasks(app, build._id, createTasksDto)).body;
      startedTask = (await startTask(app, build._id, startTaskDto)).body;
      failedTask = (await failTask(app, startedTask.task._id).expect(200)).body;
    });

    it('should fail task', () => {
      // expect
      expect(failedTask.status).toEqual(TaskStatus.Failed);
      expect(failedTask.endedAt).toBeTruthy();
      expect(failedTask.duration).toBeTruthy();
    });

    it('should abort build', () => {
      expect(failedTask.build.status).toEqual(BuildStatus.Aborted);
    });

    it('should not continue', async () => {
      // act
      const data: StartTaskResponseDto = (await startTask(app, build._id, startTaskDto).expect(200)).body;
      // expect
      expect(data.continue).toBe(false);
    });

    it('should not create new tasks', async () => {
      // act
      const res = await createTasks(app, build._id, createTasksDto).expect(500);
      // expect
      expect(res.body.reason).toEqual("Build with ABORTED status can't accept new tasks");
    });
  });

  describe('build has been closed', () => {
    let build: Build;
    let tasks: Task[];
    let startedTask: StartTaskResponseDto;
    let closedBuild: Build;

    beforeEach(async () => {
      // arrange
      build = (await createBuild(app, createBuildDto)).body;
      tasks = (await createTasks(app, build._id, createTasksDto)).body;
      startedTask = (await startTask(app, build._id, startTaskDto)).body;
      closedBuild = (await closeBuild(app, build._id)).body;
    });

    it('should close build', () => {
      // expect
      expect(closedBuild.status).toEqual(BuildStatus.Closed);
    });

    it('should complete build when task complete', async () => {
      // act
      const task: Task = (await completeTask(app, startedTask.task._id).expect(200)).body;
      // expect
      expect(task.build.status).toEqual(BuildStatus.Completed);
    });

    it('should not create new task', async () => {
      // act
      const res = await createTasks(app, build._id, createTasksDto).expect(500);
      // expect
      expect(res.body.reason).toEqual("Build with CLOSED status can't accept new tasks");
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

function createBuild(app: INestApplication, data: CreateBuildDto): request.Test {
  return request(app.getHttpServer()).post('/builds').send(data);
}

function closeBuild(app: INestApplication, buildId: any): request.Test {
  return request(app.getHttpServer()).put(`/builds/${buildId}/close`);
}

function createTasks(app: INestApplication, buildId: any, data: CreateTasksDto): request.Test {
  return request(app.getHttpServer()).post(`/builds/${buildId}/tasks`).send(data);
}

function startTask(app: INestApplication, buildId: any, data: StartTaskDto): request.Test {
  return request(app.getHttpServer()).put(`/builds/${buildId}/tasks/start`).send(data);
}

function completeTask(app: INestApplication, taskId: any): request.Test {
  return request(app.getHttpServer()).put(`/tasks/${taskId}/complete`);
}

function failTask(app: INestApplication, taskId: any): request.Test {
  return request(app.getHttpServer()).put(`/tasks/${taskId}/error`);
}
