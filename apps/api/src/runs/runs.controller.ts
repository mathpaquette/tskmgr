import { Body, Controller, Get, Param, Post, Put, Headers, UseInterceptors, UploadedFile } from '@nestjs/common';
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
import { Express } from 'express';
import { Multer } from 'multer';

@Controller('runs')
export class RunsController {
  constructor(
    private readonly runsService: RunsService, //
    private readonly tasksService: TasksService
  ) {}

  @Post()
  createRun(@Body() createRunDto: CreateRunRequestDto): Promise<RunEntity> {
    return this.runsService.create(createRunDto);
  }

  // @Put(':id/close')
  // async closeRun(@Param('id') runId: string): Promise<Run> {
  //   return this.runsService.close(runId);
  // }
  //
  // @Put(':id/leader')
  // async setLeader(
  //   @Param('id') runId: string,
  //   @Body() setLeaderRequestDto: SetLeaderRequestDto
  // ): Promise<SetLeaderResponseDto> {
  //   return this.runsService.setLeader(runId, setLeaderRequestDto);
  // }
  //
  @Get(':id')
  async findById(@Param('id') runId: number): Promise<RunEntity> {
    return this.runsService.findById(runId);
  }
  //
  // @Get()
  // async findAll(): Promise<Run[]> {
  //   return this.runsService.findAll();
  // }

  @Post(':id/tasks')
  async createTasks(@Param('id') runId: number, @Body() createTaskDto: CreateTasksDto): Promise<TaskEntity[]> {
    return this.tasksService.createTasks(runId, createTaskDto);
  }

  /**
   * Usage: curl -F file=@dump_2022-08-06.gz http://localhost:3333/api/runs/file
   * @param file
   */
  @UseInterceptors(FileInterceptor('file'))
  @Post('files')
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('sdsd')
    return {
      file
    };
  }

  //
  // @Get(':id/tasks')
  // findAllTasks(@Param('id') runId: string): Promise<Task[]> {
  //   return this.tasksService.findByRunId(runId);
  // }
  //
  // @Put(':id/tasks/start')
  // async startTask(
  //   @Headers('host') host,
  //   @Param('id') runId: string,
  //   @Body() startTaskDto: StartTaskDto
  // ): Promise<StartTaskResponseDto> {
  //   const { runnerId } = startTaskDto;
  //   const runnerHost = host.substring(0, host.indexOf(':'));
  //   return this.tasksService.findOnePendingTask(runId, runnerId, runnerHost);
  // }
  //
  // @Put(':id/abort')
  // abort(@Param('id') id: string): Promise<Run> {
  //   return this.runsService.abort(id);
  // }
  //
  // @Put(':id/fail')
  // fail(@Param('id') id: string): Promise<Run> {
  //   return this.runsService.fail(id);
  // }
}
