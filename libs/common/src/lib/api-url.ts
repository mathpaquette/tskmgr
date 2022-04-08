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
  abortRunUrl = (id: string) => this.getUrl(`/runs/${id}/abort`);
  failRunUrl = (id: string) => this.getUrl(`/runs/${id}/fail`);
  closeRunUrl = (id: string) => this.getUrl(`/runs/${id}/close`);
  setLeaderUrl = (id: string) => this.getUrl(`/runs/${id}/leader`);
  createTasksUrl = (id: string) => this.getUrl(`/runs/${id}/tasks`);
  startTaskUrl = (id: string) => this.getUrl(`/runs/${id}/tasks/start`);

  // tasks
  completeTaskUrl = (id: string) => this.getUrl(`/tasks/${id}/complete`);
  failTaskUrl = (id: string) => this.getUrl(`/tasks/${id}/fail`);

  // pull-requests
  findAllPullRequestsUrl = () => this.getUrl(`/pull-requests`);

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
