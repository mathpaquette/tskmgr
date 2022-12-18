import { Controller, Put, Param, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CompleteTaskDto } from '@tskmgr/common';
import { TaskEntity } from './task.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Put(':id/complete')
  complete(@Param('id') id: number, @Body() completeTaskDto: CompleteTaskDto): Promise<TaskEntity> {
    return this.tasksService.completeTask(id, completeTaskDto);
  }

  // @Put(':id/fail')
  // fail(@Param('id') id: string): Promise<TaskEntity> {
  //   return this.tasksService.fail(id);
  // }
}
