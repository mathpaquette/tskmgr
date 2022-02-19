export class ApiUrl {
  constructor(private readonly baseUrl: string, private readonly prefix: string) {}

  public static create(baseUrl: string, prefix = '/api'): ApiUrl {
    return new ApiUrl(baseUrl, prefix);
  }

  public static createNoPrefix(): ApiUrl {
    return new ApiUrl(null, null);
  }

  createBuildUrl = () => this.getUrl(`/builds`);
  closeBuildUrl = (id: string) => this.getUrl(`/builds/${id}/close`);
  createTasksUrl = (id: string) => this.getUrl(`/builds/${id}/tasks`);
  startTaskUrl = (id: string) => this.getUrl(`/builds/${id}/tasks/start`);
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
