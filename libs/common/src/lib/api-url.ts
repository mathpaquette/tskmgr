export class ApiUrl {
  constructor(private readonly baseUrl: string, private readonly prefix: string) {}

  public static create(baseUrl: string, prefix = '/api'): ApiUrl {
    return new ApiUrl(baseUrl, prefix);
  }

  public static createNoPrefix(): ApiUrl {
    return new ApiUrl('', '');
  }

  // runs
  createRunUrl = () => this.getUrl(`/runs`);
  getRunUrl = (id: number) => this.getUrl(`/runs/${id}`);
  abortRunUrl = (id: number) => this.getUrl(`/runs/${id}/abort`);
  failRunUrl = (id: number) => this.getUrl(`/runs/${id}/fail`);
  closeRunUrl = (id: number) => this.getUrl(`/runs/${id}/close`);
  setLeaderUrl = (id: number) => this.getUrl(`/runs/${id}/leader`);
  createTasksUrl = (id: number) => this.getUrl(`/runs/${id}/tasks`);
  startTaskUrl = (id: number) => this.getUrl(`/runs/${id}/tasks/start`);
  createFileRunUrl = (id: number) => this.getUrl(`/runs/${id}/files`);
  getTasksUrl = (id: number) => this.getUrl(`/runs/${id}/tasks`);
  getFilesUrl = (id: number) => this.getUrl(`/runs/${id}/files`);

  // tasks
  completeTaskUrl = (id: number) => this.getUrl(`/tasks/${id}/complete`);
  failTaskUrl = (id: number) => this.getUrl(`/tasks/${id}/fail`);
  createFileTaskUrl = (id: number) => this.getUrl(`/tasks/${id}/files`);

  getUrl = (url: string): string => {
    if (this.prefix) {
      url = `${this.prefix}${url}`;
    }

    if (this.baseUrl) {
      url = `${this.baseUrl}${url}`;
    }

    return url;
  };
}
