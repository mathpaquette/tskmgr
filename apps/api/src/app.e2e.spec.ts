import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {
  ApiUrl,
  RunStatus,
  CreateRunRequestDto,
  CreateTasksDto,
  StartTaskDto,
  StartTaskResponseDto,
  TaskStatus,
  SetLeaderRequestDto,
  SetLeaderResponseDto,
  Run,
  Task,
  File,
  CreateFileRequestDto,
  CreateTaskDto,
} from '@tskmgr/common';
import { AppModule } from './app.module';
import { TestDtoUtils } from './utils/test-dto-utils';

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

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    createRunDto = TestDtoUtils.createRunDto();
    createTasksDto = TestDtoUtils.createTasksDto(1);
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
    expect(data.name).toEqual(createRunDto.name);
    expect(data.url).toEqual(createRunDto.url);
    expect(new Date(res.body.createdAt)).not.toBeNaN();
  });

  it('should get run', async () => {
    // arrange
    const runId = (await createRun(app, createRunDto)).body.id;
    // act
    const run: Run = (await getRun(app, runId)).body;
    // assert
    expect(run.id).toEqual(runId);
    expect(run.status).toEqual(RunStatus.Created);
  });

  it('should complete run when no tasks created', async () => {
    // arrange
    const runId = (await createRun(app, createRunDto)).body.id;
    // act
    const run = (await closeRun(app, runId).expect(200)).body;
    // assert
    expect(run.status).toEqual(RunStatus.Completed);
  });

  it('should create tasks', async () => {
    // arrange
    const run: Run = (await createRun(app, createRunDto)).body;
    // act
    const tasks: Task[] = (await createTasks(app, run.id, createTasksDto).expect(201)).body;
    // assert
    expect(tasks.length).toBe(1);
    expect(tasks[0].status).toEqual(TaskStatus.Pending);
    expect(tasks[0].createdAt).toBeTruthy();
  });

  it('should start task', async () => {
    // arrange
    const run: Run = (await createRun(app, createRunDto)).body;
    const tasks: Task[] = (await createTasks(app, run.id, createTasksDto)).body;
    // act
    const res = await startTask(app, run.id, startTaskDto);
    const data: StartTaskResponseDto = res.body;
    // expect
    expect(res.status).toEqual(200);
    expect(data.continue).toEqual(true);
    expect(data.task).toBeTruthy();
    expect(data.task.status).toEqual(TaskStatus.Running);
    expect(data.task.startedAt).toBeTruthy();
  });

  it('should start tasks in sequence task-3 -> task-1 -> task-2', async () => {
    // arrange
    const tasksDto: CreateTaskDto[] = [
      {
        name: 'task-1',
        type: 'test',
        command: 'command-1',
        dependsOn: ['task-3'],
        options: { shell: true },
      },
      {
        name: 'task-2',
        type: 'test',
        command: 'command-1',
        dependsOn: ['task-3', 'task-1'],
        options: { shell: true },
      },
      {
        name: 'task-3',
        type: 'test',
        command: 'command-1',
        options: { shell: true },
      },
    ];
    const run: Run = (await createRun(app, createRunDto)).body;
    await createTasks(app, run.id, { tasks: tasksDto });

    // act
    let startedTask = (await startTask(app, run.id, startTaskDto)).body;
    // expect
    expect(startedTask.task.name).toEqual('task-3');

    // act
    await completeTask(app, startedTask.task.id).expect(200);
    startedTask = (await startTask(app, run.id, startTaskDto)).body;
    // expect
    expect(startedTask.task.name).toEqual('task-1');

    // act
    await completeTask(app, startedTask.task.id).expect(200);
    startedTask = (await startTask(app, run.id, startTaskDto)).body;
    // expect
    expect(startedTask.task.name).toEqual('task-2');
  });

  it('should wait for task-3 to complete before starting task-2', async () => {
    // arrange
    const tasksDto: CreateTaskDto[] = [
      {
        name: 'task-1',
        type: 'test',
        command: 'command-1',
        dependsOn: ['task-3'],
        options: { shell: true },
      },
      {
        name: 'task-3',
        type: 'test',
        command: 'command-1',
        options: { shell: true },
      },
    ];
    const run: Run = (await createRun(app, createRunDto)).body;
    await createTasks(app, run.id, { tasks: tasksDto });

    // act
    let startedTask = (await startTask(app, run.id, startTaskDto)).body;
    // expect
    expect(startedTask.task.name).toEqual('task-3');

    // act
    const startedEmptyTask = (await startTask(app, run.id, startTaskDto)).body;
    // expect
    expect(startedEmptyTask.continue).toEqual(true);
    expect(startedEmptyTask.task).toBeFalsy();

    // act
    const completedTask = (await completeTask(app, startedTask.task.id).expect(200)).body;
    // expect
    expect(completedTask.status).toEqual(TaskStatus.Completed);
    expect(completedTask.name).toEqual('task-3');

    // act
    startedTask = (await startTask(app, run.id, startTaskDto)).body;
    // expect
    expect(startedTask.task.name).toEqual('task-1');
  });

  it('should complete task', async () => {
    // arrange
    const run: Run = (await createRun(app, createRunDto)).body;
    const tasks: Task[] = (await createTasks(app, run.id, createTasksDto)).body;
    const startedTask: StartTaskResponseDto = (await startTask(app, run.id, startTaskDto)).body;
    // act
    const data: Task = (await completeTask(app, startedTask.task.id).expect(200)).body;
    // expect
    expect(data.status).toEqual(TaskStatus.Completed);
    expect(data.endedAt).toBeTruthy();
    expect(data.duration).toBeTruthy();
    expect(data.run.status).toEqual(RunStatus.Started);
  });

  describe('files', () => {
    let run: Run;
    let tasks: Task[];

    beforeAll(async () => {
      // arrange
      const createRunDto = TestDtoUtils.createRunDto();
      const createTasksDto = TestDtoUtils.createTasksDto(1);
      run = (await createRun(app, createRunDto)).body;
      tasks = (await createTasks(app, run.id, createTasksDto)).body;
    });

    it('should add file to run', async () => {
      // arrange
      const createFileDto: CreateFileRequestDto = { type: 'log', description: 'desc' };
      // act
      const file: File = (await createFileRun(app, run.id, createFileDto, './README.md')).body;
      // assert
      expect(file.type).toBe(createFileDto.type);
      expect(file.description).toBe(createFileDto.description);
      expect(file.run.id).toEqual(run.id);
    });

    it('should add file to task', async () => {
      // arrange
      const createFileDto: CreateFileRequestDto = { type: 'log', description: 'desc' };
      // act
      const file: File = (await createFileTask(app, tasks[0].id, createFileDto, './README.md')).body;
      // assert
      expect(file.type).toBe(createFileDto.type);
      expect(file.description).toBe(createFileDto.description);
      expect(file.task.id).toEqual(tasks[0].id);
    });
  });

  describe('fail task', () => {
    it('should abort running tasks when failFast enabled', async () => {
      // arrange
      const createRunDto = TestDtoUtils.createRunDto();
      const run: Run = (await createRun(app, createRunDto)).body;
      await createTasks(app, run.id, TestDtoUtils.createTasksDto(5));
      const startedTask1: StartTaskResponseDto = (await startTask(app, run.id, startTaskDto)).body;
      const startedTask2: StartTaskResponseDto = (await startTask(app, run.id, startTaskDto)).body;
      // act
      const failedTask: Task = (await failTask(app, startedTask1.task.id).expect(200)).body;
      const tasks: Task[] = (await getTasks(app, run.id).expect(200)).body;
      const abortedTask: Task = tasks.find((x) => x.id === startedTask2.task.id);
      // assert
      expect(failedTask.status).toBe(TaskStatus.Failed);
      expect(abortedTask.status).toBe(TaskStatus.Aborted);
      expect(failedTask.run.status).toBe(RunStatus.Failed);
    });
  });

  describe('abort run', () => {
    it('should abort run when not ended', async () => {
      // arrange
      const createRunDto = TestDtoUtils.createRunDto();
      const run: Run = (await createRun(app, createRunDto)).body;
      // act
      const abortedRun: Run = (await abortRun(app, run.id).expect(200)).body;
      // assert
      expect(abortedRun.endedAt).toBeTruthy();
      expect(abortedRun.status).toBe(RunStatus.Aborted);
    });

    it('should not abort run when already ended', async () => {
      // arrange
      const createRunDto = TestDtoUtils.createRunDto();
      const run: Run = (await createRun(app, createRunDto)).body;
      const abortedRun: Run = (await abortRun(app, run.id).expect(200)).body;
      // act
      const exception = (await abortRun(app, run.id)).body;
      // assert
      expect(exception.statusCode).toBe(500);
      expect(exception.message).toBe("Can't abort already ended run.");
    });

    it('should abort running tasks', async () => {
      // arrange
      const createRunDto = TestDtoUtils.createRunDto();
      const run: Run = (await createRun(app, createRunDto)).body;
      await createTasks(app, run.id, createTasksDto);
      const startTaskResponseDto: StartTaskResponseDto = (await startTask(app, run.id, startTaskDto)).body;
      // act
      const abortedRun: Run = (await abortRun(app, run.id).expect(200)).body;
      // assert
      const abortedTask = abortedRun.tasks.find((x) => x.id === startTaskResponseDto.task.id);
      expect(abortedTask.status).toBe(TaskStatus.Aborted);
    });
  });

  describe('fail run', () => {
    let run: Run;

    beforeAll(async () => {
      // arrange
      const createRunDto = TestDtoUtils.createRunDto();
      run = (await createRun(app, createRunDto)).body;
    });

    it('should fail run when not ended', async () => {
      // act
      run = (await failRun(app, run.id).expect(200)).body;
      // assert
      expect(run.endedAt).toBeTruthy();
      expect(run.status).toBe(RunStatus.Failed);
    });

    it('should not fail run when already ended', async () => {
      // act
      const exception = (await failRun(app, run.id)).body;
      // assert
      expect(exception.statusCode).toBe(500);
      expect(exception.message).toBe("Can't fail already ended run.");
    });
  });

  describe('set leader', () => {
    let run: Run;

    beforeAll(async () => {
      // arrange
      const createRunDto = TestDtoUtils.createRunDto();
      run = (await createRun(app, createRunDto)).body;
    });

    it('should set leader when called first', async () => {
      // arrange
      const runnerId = 'RUNNER_1';
      // act
      const setLeaderResponseDto: SetLeaderResponseDto = (await setLeader(app, run.id, { runnerId }).expect(200)).body;
      // assert
      expect(setLeaderResponseDto.leader).toBe(true);
      expect(setLeaderResponseDto.run).toBeTruthy();
      expect(setLeaderResponseDto.run.leaderId).toBe(runnerId);
    });

    it('should not set leader when not called first', async () => {
      // arrange
      const runnerId = 'RUNNER_2';
      // act
      const setLeaderResponseDto: SetLeaderResponseDto = (await setLeader(app, run.id, { runnerId }).expect(200)).body;
      // assert
      expect(setLeaderResponseDto.leader).toBe(false);
      expect(setLeaderResponseDto.run).toBeFalsy();
    });
  });

  describe('one task has failed', () => {
    let run: Run;
    let tasks: Task[];
    let startedTask: StartTaskResponseDto;
    let failedTask: Task;

    beforeEach(async () => {
      // arrange
      run = (await createRun(app, createRunDto)).body;
      tasks = (await createTasks(app, run.id, createTasksDto)).body;
      startedTask = (await startTask(app, run.id, startTaskDto)).body;
      failedTask = (await failTask(app, startedTask.task.id).expect(200)).body;
    });

    it('should fail task', () => {
      // expect
      expect(failedTask.status).toEqual(TaskStatus.Failed);
      expect(failedTask.endedAt).toBeTruthy();
      expect(failedTask.duration).toBeTruthy();
    });

    it('should abort run', () => {
      expect(failedTask.run.status).toEqual(RunStatus.Failed);
    });

    it('should not continue', async () => {
      // act
      const data: StartTaskResponseDto = (await startTask(app, run.id, startTaskDto).expect(200)).body;
      // expect
      expect(data.continue).toBe(false);
    });

    it('should not create new tasks', async () => {
      // act
      const res = await createTasks(app, run.id, createTasksDto).expect(500);
      // expect
      expect(res.body.message).toEqual("Run with FAILED status can't accept new tasks");
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
      tasks = (await createTasks(app, run.id, createTasksDto)).body;
      startedTask = (await startTask(app, run.id, startTaskDto)).body;
      closedRun = (await closeRun(app, run.id).expect(200)).body;
    });

    it('should close run', () => {
      // expect
      expect(closedRun.closed).toEqual(true);
    });

    it('should complete run when task complete', async () => {
      // act
      const task: Task = (await completeTask(app, startedTask.task.id).expect(200)).body;
      // expect
      expect(task.run.status).toEqual(RunStatus.Completed);
    });

    it('should not create new task', async () => {
      // act
      const res = await createTasks(app, run.id, createTasksDto).expect(500);
      // expect
      expect(res.body.message).toEqual("Closed run can't accept new tasks");
    });
  });
});

function createRun(app: INestApplication, data: CreateRunRequestDto): request.Test {
  return request(app.getHttpServer()).post(ApiUrl.createNoPrefix().createRunUrl()).send(data);
}

function getRun(app: INestApplication, runId: number): request.Test {
  return request(app.getHttpServer()).get(ApiUrl.createNoPrefix().getRunUrl(runId));
}

function getTasks(app: INestApplication, runId: number): request.Test {
  return request(app.getHttpServer()).get(ApiUrl.createNoPrefix().getTasksUrl(runId));
}

function abortRun(app: INestApplication, runId: number): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().abortRunUrl(runId));
}

function failRun(app: INestApplication, runId: number): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().failRunUrl(runId));
}

function closeRun(app: INestApplication, runId: number): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().closeRunUrl(runId));
}

function setLeader(app: INestApplication, runId: number, data: SetLeaderRequestDto): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().setLeaderUrl(runId)).send(data);
}

function createTasks(app: INestApplication, runId: number, data: CreateTasksDto): request.Test {
  return request(app.getHttpServer()).post(ApiUrl.createNoPrefix().createTasksUrl(runId)).send(data);
}

function createFileRun(app: INestApplication, runId: number, data: CreateFileRequestDto, file: string): request.Test {
  return request(app.getHttpServer())
    .post(ApiUrl.createNoPrefix().createFileRunUrl(runId))
    .attach('file', file)
    .field('type', data.type)
    .field('description', data.description);
}

function createFileTask(app: INestApplication, taskId: number, data: CreateFileRequestDto, file: string): request.Test {
  return request(app.getHttpServer())
    .post(ApiUrl.createNoPrefix().createFileTaskUrl(taskId))
    .attach('file', file)
    .field('type', data.type)
    .field('description', data.description);
}

function startTask(app: INestApplication, runId: number, data: StartTaskDto): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().startTaskUrl(runId)).send(data);
}

function completeTask(app: INestApplication, taskId: number): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().completeTaskUrl(taskId));
}

function failTask(app: INestApplication, taskId: number): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().failTaskUrl(taskId));
}
