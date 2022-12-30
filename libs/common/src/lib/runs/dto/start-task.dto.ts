import { RunnerInfo } from '../../tasks/runner-info';

export class StartTaskDto {
  readonly runnerId: string;
  readonly runnerInfo?: RunnerInfo;
}
