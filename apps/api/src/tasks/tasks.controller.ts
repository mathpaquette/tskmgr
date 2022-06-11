import { Controller, Put, Param, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './schemas/task.schema';
import { CompleteTaskDto } from '@tskmgr/common';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Put(':id/complete')
  complete(@Param('id') id: string, @Body() completeTaskDto: CompleteTaskDto): Promise<Task> {
    return this.tasksService.complete(id, completeTaskDto);
  }

  @Put(':id/fail')
  fail(@Param('id') id: string): Promise<Task> {
    return this.tasksService.fail(id);
  }
}
