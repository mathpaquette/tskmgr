import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL_TOKEN } from '../common/api-url.token';
import { ApiUrl, Run, Task, File } from '@tskmgr/common';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RunsService {
  constructor(
    private readonly http: HttpClient, //
    @Inject(API_URL_TOKEN) private readonly apiUrl: ApiUrl
  ) {}

  public findAll(search?: string): Observable<Run[]> {
    const url = this.apiUrl.createRunUrl();
    const params = search ? new HttpParams().set('search', search) : new HttpParams();
    return this.http.get<Run[]>(url, { params }).pipe(
      map((runs) =>
        runs.map((x) => {
          return {
            ...x,
            createdAt: new Date(x.createdAt),
            updatedAt: new Date(x.updatedAt),
            endedAt: x.endedAt ? new Date(x.endedAt) : null,
          };
        })
      )
    );
  }

  public findById(id: number): Observable<Run> {
    const url = this.apiUrl.getRunUrl(id);
    return this.http.get<Run>(url).pipe(
      map((x) => {
        return {
          ...x,
          createdAt: new Date(x.createdAt),
          updatedAt: new Date(x.updatedAt),
          endedAt: x.endedAt ? new Date(x.endedAt) : null,
        };
      })
    );
  }

  public findTasksById(id: number): Observable<Task[]> {
    const url = this.apiUrl.getTasksUrl(id);
    return this.http.get<Task[]>(url).pipe(
      map((tasks) =>
        tasks.map((x) => {
          return {
            ...x,
            createdAt: new Date(x.createdAt),
            updatedAt: new Date(x.updatedAt),
            startedAt: x.startedAt ? new Date(x.startedAt) : null,
            endedAt: x.endedAt ? new Date(x.endedAt) : null,
          };
        })
      )
    );
  }

  public findFilesById(id: number): Observable<File[]> {
    const url = this.apiUrl.getFilesUrl(id);
    return this.http.get<File[]>(url);
  }
}
