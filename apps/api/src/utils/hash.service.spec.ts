import { HashService } from './hash.service';
import { TaskEntity } from '../tasks/task.entity';

describe('HashService', () => {
  let service: HashService;

  beforeEach(() => {
    service = new HashService();
  });

  it('should generate a hash for a task', () => {
    // arrange
    const task = new TaskEntity();
    task.id = 1;
    task.name = 'Test Task';
    task.command = 'echo "Hello World"';
    task.arguments = ['arg1', 'arg2'];
    task.options = { cwd: '/tmp' };
    // act
    const hash = service.generateHash(task);
    // assert
    expect(hash).toBe('L+DDxmTwODSey5i+VrSx9h6/Hl9n0rS4mvJzZ0SmGmE=');
    expect(hash).toHaveLength(44);
  });
});
