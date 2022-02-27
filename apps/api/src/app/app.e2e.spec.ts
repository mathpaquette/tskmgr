import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { v4 as uuid } from 'uuid';
import { Build } from './builds/schemas/build.schema';
import { Task } from './tasks/schemas/task.schema';
import { ApiUrl, BuildStatus, CreateBuildRequestDto, CreateTasksDto, StartTaskDto, StartTaskResponseDto, TaskStatus } from '@tskmgr/common';

describe('Builds', () => {
  let app: INestApplication;

  let createBuildDto: CreateBuildRequestDto;
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
      name: `test-project-${uuid()}`,
      type: 'test-type',
      pullRequestId: `test-pr-${uuid()}`,
    };
    createTasksDto = {
      tasks: [{ name: 'test-app', command: 'nx', type: 'lint' }],
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
    const tasks: Task[] = (await createTasks(app, build._id, createTasksDto).expect(201)).body;
    // assert
    expect(tasks.length).toBe(1);
    expect(tasks[0].status).toEqual(TaskStatus.Pending);
    expect(tasks[0].createdAt).toBeTruthy();
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

function createBuild(app: INestApplication, data: CreateBuildRequestDto): request.Test {
  return request(app.getHttpServer()).post(ApiUrl.createNoPrefix().createBuildUrl()).send(data);
}

function closeBuild(app: INestApplication, buildId: any): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().closeBuildUrl(buildId));
}

function createTasks(app: INestApplication, buildId: any, data: CreateTasksDto): request.Test {
  return request(app.getHttpServer()).post(ApiUrl.createNoPrefix().createTasksUrl(buildId)).send(data);
}

function startTask(app: INestApplication, buildId: any, data: StartTaskDto): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().startTaskUrl(buildId)).send(data);
}

function completeTask(app: INestApplication, taskId: any): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().completeTaskUrl(taskId));
}

function failTask(app: INestApplication, taskId: any): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().failTaskUrl(taskId));
}