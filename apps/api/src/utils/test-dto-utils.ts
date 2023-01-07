import { CreateRunRequestDto, CreateTaskDto, CreateTasksDto } from '@tskmgr/common';
import { v4 as uuid } from 'uuid';

export class TestDtoUtils {
  public static createRunDto(): CreateRunRequestDto {
    const id = TestDtoUtils.getShortId(16);
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

  public static createTasksDto(size: number): CreateTasksDto {
    const tasks: CreateTaskDto[] = [];

    for (let i = 0; i < size; i++) {
      tasks.push({
        name: `name-${i}`,
        type: 'test',
        command: `command-${i}`,
        arguments: ['a1', 'a2'],
        options: { shell: true },
      });
    }

    return { tasks };
  }

  public static getShortId(size: number): string {
    const hexString = uuid().replace(/-/g, '');
    const base64String = Buffer.from(hexString, 'hex').toString('base64');
    return base64String.slice(0, size);
  }
}
