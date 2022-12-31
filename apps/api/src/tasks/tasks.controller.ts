import { Controller, Put, Param, Body, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CompleteTaskDto, CreateFileRequestDto } from '@tskmgr/common';
import { TaskEntity } from './task.entity';
import { FileEntity } from '../files/file.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Put(':id/complete')
  complete(@Param('id') id: number, @Body() completeTaskDto: CompleteTaskDto): Promise<TaskEntity> {
    return this.tasksService.completeTask(id, completeTaskDto);
  }

  @Put(':id/fail')
  fail(@Param('id') id: number): Promise<TaskEntity> {
    return this.tasksService.fail(id);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post(':id/files')
  createFile(
    @Param('id') taskId: number,
    @Body() createFileRequestDto: CreateFileRequestDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<FileEntity> {
    return this.tasksService.createFile(taskId, file, createFileRequestDto);
  }
}
