export class CreateTaskDto {
  readonly name: string;
  readonly type: string;
  readonly command: string;
  readonly arguments?: string[];
  readonly options?: object;
}
