import { Body, Controller, Get, Param, Post, Put, Headers } from '@nestjs/common';
import {
  CreateRunRequestDto,
  CreateTasksDto,
  StartTaskDto,
  StartTaskResponseDto,
  SetLeaderRequestDto,
  SetLeaderResponseDto,
} from '@tskmgr/common';
import { RunsService } from './runs.service';
import { Run } from './schemas/run.schema';
import { Task } from '../tasks/schemas/task.schema';
import { TasksService } from '../tasks/tasks.service';

@Controller('runs')
export class RunsController {
  constructor(
    private readonly runsService: RunsService, //
    private readonly tasksService: TasksService
  ) {}

  @Post()
  createRun(@Body() createRunDto: CreateRunRequestDto): Promise<Run> {
    return this.runsService.create(createRunDto);
  }

  @Put(':id/close')
  async closeRun(@Param('id') runId: string): Promise<Run> {
    return this.runsService.close(runId);
  }

  @Put(':id/leader')
  async setLeader(@Param('id') runId: string, @Body() setLeaderRequestDto: SetLeaderRequestDto): Promise<SetLeaderResponseDto> {
    return this.runsService.setLeader(runId, setLeaderRequestDto);
  }

  @Get()
  async findAll(): Promise<Run[]> {
    return this.runsService.findAll();
  }

  @Post(':id/tasks')
  createTask(@Param('id') runId: string, @Body() createTaskDto: CreateTasksDto): Promise<Task[]> {
    return this.tasksService.createTasks(runId, createTaskDto);
  }

  @Get(':id/tasks')
  findAllTasks(@Param('id') runId: string): Promise<Task[]> {
    return this.tasksService.findByRunId(runId);
  }

  @Put(':id/tasks/start')
  async startTask(@Headers('host') host, @Param('id') runId: string, @Body() startTaskDto: StartTaskDto): Promise<StartTaskResponseDto> {
    const { runnerId } = startTaskDto;
    const runnerHost = host.substring(0, host.indexOf(':'));
    return this.tasksService.findOnePendingTask(runId, runnerId, runnerHost);
  }

  @Put(':id/abort')
  abort(@Param('id') id: string): Promise<Run> {
    return this.runsService.abort(id);
  }

  @Put(':id/fail')
  fail(@Param('id') id: string): Promise<Run> {
    return this.runsService.fail(id);
  }
}
