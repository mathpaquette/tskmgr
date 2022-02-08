import { Body, Controller, Get, Param, Post, Put, Headers } from '@nestjs/common';
import { CreateBuildDto } from './dto/create-build.dto';
import { BuildsService } from './builds.service';
import { Build } from './schemas/build.schema';
import { StartTaskResponseDto } from './dto/start-task-response.dto';
import { CreateTasksDto } from '../tasks/dto/create-tasks.dto';
import { Task } from '../tasks/schemas/task.schema';
import { TasksService } from '../tasks/tasks.service';
import { StartTaskDto } from './dto/start-task.dto';

@Controller('builds')
export class BuildsController {
  constructor(
    private readonly buildsService: BuildsService, //
    private readonly tasksService: TasksService
  ) {}

  @Post()
  createBuild(@Body() createBuildDto: CreateBuildDto): Promise<Build> {
    return this.buildsService.create(createBuildDto);
  }

  @Put(':id/close')
  async closeBuild(@Param('id') buildId: string): Promise<Build> {
    return this.buildsService.close(buildId);
  }

  @Get()
  async findAll(): Promise<Build[]> {
    return this.buildsService.findAll();
  }

  @Post(':id/tasks')
  createTask(@Param('id') buildId: string, @Body() createTaskDto: CreateTasksDto): Promise<Task[]> {
    return this.tasksService.createTasks(buildId, createTaskDto);
  }

  @Get(':id/tasks')
  findAllTasks(@Param('id') buildId: string): Promise<Task[]> {
    return this.tasksService.findByBuildId(buildId);
  }

  @Put(':id/tasks/start')
  async startTask(@Headers('host') host, @Param('id') buildId: string, @Body() startTaskDto: StartTaskDto): Promise<StartTaskResponseDto> {
    const { runnerId } = startTaskDto;
    const runnerHost = host.substring(0, host.indexOf(':'));
    return this.tasksService.findOnePendingTask(buildId, runnerId, runnerHost);
  }
}
