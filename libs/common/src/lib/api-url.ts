export class ApiUrl {
  constructor(private readonly baseUrl: string, private readonly prefix: string) {}

  public static create(baseUrl: string, prefix = '/api'): ApiUrl {
    return new ApiUrl(baseUrl, prefix);
  }

  public static createNoPrefix(): ApiUrl {
    return new ApiUrl(null, null);
  }

  createRunUrl = () => this.getUrl(`/runs`);
  closeRunUrl = (id: string) => this.getUrl(`/runs/${id}/close`);
  createTasksUrl = (id: string) => this.getUrl(`/runs/${id}/tasks`);
  startTaskUrl = (id: string) => this.getUrl(`/runs/${id}/tasks/start`);
  completeTaskUrl = (id: string) => this.getUrl(`/tasks/${id}/complete`);
  failTaskUrl = (id: string) => this.getUrl(`/tasks/${id}/fail`);

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
