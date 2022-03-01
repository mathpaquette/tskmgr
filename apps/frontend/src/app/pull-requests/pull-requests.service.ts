import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PullRequest } from '@tskmgr/common';
import { API_URL_TOKEN } from '../common/api-url.token';

@Injectable({
  providedIn: 'root',
})
export class PullRequestsService {
  constructor(private readonly http: HttpClient, @Inject(API_URL_TOKEN) private readonly apiUrl: any) {}

  public findAll(): Observable<PullRequest[]> {
    const url = this.apiUrl.findAllPullRequestsUrl();
    return this.http.get<PullRequest[]>(url);
  }
}
