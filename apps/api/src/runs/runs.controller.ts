import { Body, Controller, Get, Param, Post, Put, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import {
  CreateRunRequestDto,
  CreateTasksDto,
  StartTaskDto,
  StartTaskResponseDto,
  SetLeaderRequestDto,
  SetLeaderResponseDto,
  CreateFileRequestDto,
} from '@tskmgr/common';
import { RunsService } from './runs.service';
import { RunEntity } from './run.entity';
import { TasksService } from '../tasks/tasks.service';
import { TaskEntity } from '../tasks/task.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { PendingTasksService } from '../tasks/pending-tasks.service';
import { FileEntity } from '../files/file.entity';
import { ApiQuery } from '@nestjs/swagger';

@Controller('runs')
export class RunsController {
  constructor(
    private readonly runsService: RunsService, //
    private readonly tasksService: TasksService,
    private readonly pendingTasksService: PendingTasksService
  ) {}

  @Post()
  createRun(@Body() createRunDto: CreateRunRequestDto): Promise<RunEntity> {
    return this.runsService.createRun(createRunDto);
  }

  @Put(':id/close')
  async closeRun(@Param('id') runId: number): Promise<RunEntity> {
    return this.runsService.close(runId);
  }

  @Put(':id/leader')
  async setLeader(
    @Param('id') runId: number,
    @Body() setLeaderRequestDto: SetLeaderRequestDto
  ): Promise<SetLeaderResponseDto> {
    return this.runsService.setLeader(runId, setLeaderRequestDto);
  }

  @Get(':id')
  async findById(@Param('id') runId: number): Promise<RunEntity> {
    return this.runsService.findById(runId);
  }

  @Get(':id/tasks')
  async findTasksById(@Param('id') runId: number): Promise<TaskEntity[]> {
    return this.runsService.findTasksById(runId);
  }

  @Get(':id/files')
  async findFilesById(@Param('id') runId: number): Promise<FileEntity[]> {
    return this.runsService.findFilesById(runId);
  }

  @Get()
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(@Query('search') search: string): Promise<RunEntity[]> {
    return this.runsService.findAll(search);
  }

  @Post(':id/tasks')
  async createTasks(@Param('id') runId: number, @Body() createTaskDto: CreateTasksDto): Promise<TaskEntity[]> {
    return this.tasksService.createTasks(runId, createTaskDto);
  }

  @Post(':id/files')
  @UseInterceptors(FileInterceptor('file'))
  createFile(
    @Param('id') runId: number,
    @Body() createFileRequestDto: CreateFileRequestDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<FileEntity> {
    return this.runsService.createFile(runId, file, createFileRequestDto);
  }

  @Put(':id/tasks/start')
  async startTask(
    @Param('id') runId: number, //
    @Body() startTaskDto: StartTaskDto
  ): Promise<StartTaskResponseDto> {
    return this.pendingTasksService.startPendingTask(runId, startTaskDto);
  }

  @Put(':id/abort')
  abort(@Param('id') id: number): Promise<RunEntity> {
    return this.runsService.abort(id);
  }

  @Put(':id/fail')
  fail(@Param('id') id: number): Promise<RunEntity> {
    return this.runsService.fail(id);
  }
}
