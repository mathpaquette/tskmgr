import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL_TOKEN } from '../common/api-url.token';
import { ApiUrl, Run, Task } from '@tskmgr/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RunsService {
  constructor(
    private readonly http: HttpClient, //
    @Inject(API_URL_TOKEN) private readonly apiUrl: ApiUrl
  ) {}

  public findAll(): Observable<Run[]> {
    const url = this.apiUrl.createRunUrl();
    return this.http.get<Run[]>(url);
  }

  public findTasks(id: string): Observable<Task[]> {
    const url = this.apiUrl.createTasksUrl(id);
    return this.http.get<Task[]>(url);
  }
}
