import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
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
} from '@tskmgr/common';
import { AppModule } from './app.module';

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
    createRunDto = DtoUtils.createRunDto();
    createTasksDto = {
      tasks: [{ name: 'test', type: 'lint', command: 'nx', arguments: ['a1', 'a2'], options: { shell: true } }],
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
    expect(data.task.status).toEqual(TaskStatus.Started);
    expect(data.task.startedAt).toBeTruthy();
  });
  //
  // it('should complete task', async () => {
  //   // arrange
  //   const run: Run = (await createRun(app, createRunDto)).body;
  //   const tasks: Task[] = (await createTasks(app, run._id, createTasksDto)).body;
  //   const startedTask: StartTaskResponseDto = (await startTask(app, run._id, startTaskDto)).body;
  //   // act
  //   const data: Task = (await completeTask(app, startedTask.task._id).expect(200)).body;
  //   // expect
  //   expect(data.status).toEqual(TaskStatus.Completed);
  //   expect(data.endedAt).toBeTruthy();
  //   expect(data.duration).toBeTruthy();
  //   expect(data.run.status).toEqual(RunStatus.Started);
  // });
  //
  // describe('abort run', () => {
  //   let run: Run;
  //
  //   beforeAll(async () => {
  //     // arrange
  //     const createRunDto = DtoHelper.createRunDto();
  //     run = (await createRun(app, createRunDto)).body;
  //   });
  //
  //   it('should abort run when not ended', async () => {
  //     // act
  //     run = (await abortRun(app, run._id).expect(200)).body;
  //     // assert
  //     expect(run.endedAt).toBeTruthy();
  //     expect(run.status).toBe(RunStatus.Aborted);
  //   });
  //
  //   it('should not abort run when already ended', async () => {
  //     // act
  //     const exception = (await abortRun(app, run._id)).body;
  //     // assert
  //     expect(exception.statusCode).toBe(500);
  //     expect(exception.reason).toBe("Can't abort already ended run.");
  //   });
  // });
  //
  // describe('fail run', () => {
  //   let run: Run;
  //
  //   beforeAll(async () => {
  //     // arrange
  //     const createRunDto = DtoHelper.createRunDto();
  //     run = (await createRun(app, createRunDto)).body;
  //   });
  //
  //   it('should fail run when not ended', async () => {
  //     // act
  //     run = (await failRun(app, run._id).expect(200)).body;
  //     // assert
  //     expect(run.endedAt).toBeTruthy();
  //     expect(run.status).toBe(RunStatus.Failed);
  //   });
  //
  //   it('should not fail run when already ended', async () => {
  //     // act
  //     const exception = (await failRun(app, run._id)).body;
  //     // assert
  //     expect(exception.statusCode).toBe(500);
  //     expect(exception.reason).toBe("Can't fail already ended run.");
  //   });
  // });
  //
  // describe('set leader', () => {
  //   let run: Run;
  //
  //   beforeAll(async () => {
  //     // arrange
  //     const createRunDto = DtoHelper.createRunDto();
  //     run = (await createRun(app, createRunDto)).body;
  //   });
  //
  //   it('should set leader when called first', async () => {
  //     // arrange
  //     const runnerId = 'RUNNER_1';
  //     // act
  //     const setLeaderResponseDto: SetLeaderResponseDto = (await setLeader(app, run._id, { runnerId }).expect(200)).body;
  //     // assert
  //     expect(setLeaderResponseDto.isLeader).toBe(true);
  //     expect(setLeaderResponseDto.run).toBeTruthy();
  //     expect(setLeaderResponseDto.run.leaderId).toBe(runnerId);
  //   });
  //
  //   it('should not set leader when not called first', async () => {
  //     // arrange
  //     const runnerId = 'RUNNER_2';
  //     // act
  //     const setLeaderResponseDto: SetLeaderResponseDto = (await setLeader(app, run._id, { runnerId }).expect(200)).body;
  //     // assert
  //     expect(setLeaderResponseDto.isLeader).toBe(false);
  //     expect(setLeaderResponseDto.run).toBeFalsy();
  //   });
  // });
  //
  // describe('one task has failed', () => {
  //   let run: Run;
  //   let tasks: Task[];
  //   let startedTask: StartTaskResponseDto;
  //   let failedTask: Task;
  //
  //   beforeEach(async () => {
  //     // arrange
  //     run = (await createRun(app, createRunDto)).body;
  //     tasks = (await createTasks(app, run._id, createTasksDto)).body;
  //     startedTask = (await startTask(app, run._id, startTaskDto)).body;
  //     failedTask = (await failTask(app, startedTask.task._id).expect(200)).body;
  //   });
  //
  //   it('should fail task', () => {
  //     // expect
  //     expect(failedTask.status).toEqual(TaskStatus.Failed);
  //     expect(failedTask.endedAt).toBeTruthy();
  //     expect(failedTask.duration).toBeTruthy();
  //   });
  //
  //   it('should abort run', () => {
  //     expect(failedTask.run.status).toEqual(RunStatus.Failed);
  //   });
  //
  //   it('should not continue', async () => {
  //     // act
  //     const data: StartTaskResponseDto = (await startTask(app, run._id, startTaskDto).expect(200)).body;
  //     // expect
  //     expect(data.continue).toBe(false);
  //   });
  //
  //   it('should not create new tasks', async () => {
  //     // act
  //     const res = await createTasks(app, run._id, createTasksDto).expect(500);
  //     // expect
  //     expect(res.body.reason).toEqual("Run with FAILED status can't accept new tasks");
  //   });
  // });
  //
  // describe('run has been closed', () => {
  //   let run: Run;
  //   let tasks: Task[];
  //   let startedTask: StartTaskResponseDto;
  //   let closedRun: Run;
  //
  //   beforeEach(async () => {
  //     // arrange
  //     run = (await createRun(app, createRunDto)).body;
  //     tasks = (await createTasks(app, run._id, createTasksDto)).body;
  //     startedTask = (await startTask(app, run._id, startTaskDto)).body;
  //     closedRun = (await closeRun(app, run._id)).body;
  //   });
  //
  //   it('should close run', () => {
  //     // expect
  //     expect(closedRun.closed).toEqual(true);
  //   });
  //
  //   it('should complete run when task complete', async () => {
  //     // act
  //     const task: Task = (await completeTask(app, startedTask.task._id).expect(200)).body;
  //     // expect
  //     expect(task.run.status).toEqual(RunStatus.Completed);
  //   });
  //
  //   it('should not create new task', async () => {
  //     // act
  //     const res = await createTasks(app, run._id, createTasksDto).expect(500);
  //     // expect
  //     expect(res.body.reason).toEqual("Closed run can't accept new tasks");
  //   });
  // });

  afterAll(async () => {
    await app.close();
  });
});

class DtoUtils {
  public static createRunDto(): CreateRunRequestDto {
    const id = DtoUtils.getShortId(16);
    return {
      name: `${id}`,
      url: `http://${id}/`,
      type: 'test',
      parameters: {
        name: `PR-${id}`,
        runner_size: 4,
      },
      failFast: true,
    };
  }
  public static getShortId(size: number): string {
    const hexString = uuid().replace(/-/g, '');
    const base64String = Buffer.from(hexString, 'hex').toString('base64');
    return base64String.slice(0, size);
  }
}

function createRun(app: INestApplication, data: CreateRunRequestDto): request.Test {
  return request(app.getHttpServer()).post(ApiUrl.createNoPrefix().createRunUrl()).send(data);
}

function getRun(app: INestApplication, runId: number): request.Test {
  return request(app.getHttpServer()).get(ApiUrl.createNoPrefix().getRunUrl(runId));
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

function startTask(app: INestApplication, runId: number, data: StartTaskDto): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().startTaskUrl(runId)).send(data);
}

function completeTask(app: INestApplication, taskId: number): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().completeTaskUrl(taskId));
}

function failTask(app: INestApplication, taskId: number): request.Test {
  return request(app.getHttpServer()).put(ApiUrl.createNoPrefix().failTaskUrl(taskId));
}
