export class StartTaskDto {
  readonly runnerId: string;
  readonly runnerInfo?: { [key: string]: string };
}
