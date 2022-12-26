import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL_TOKEN } from '../common/api-url.token';
import { ApiUrl, Run } from '@tskmgr/common';
import { Observable, shareReplay } from 'rxjs';

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
    return this.http.get<Run[]>(url, { params });
  }

  public findById(id: number): Observable<Run> {
    const url = this.apiUrl.getRunUrl(id);
    return this.http.get<Run>(url).pipe(shareReplay());
  }
}
