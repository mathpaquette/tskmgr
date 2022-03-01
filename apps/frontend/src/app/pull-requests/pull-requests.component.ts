import { Component, OnInit } from '@angular/core';
import { PullRequestsService } from './pull-requests.service';
import { EMPTY, Observable } from 'rxjs';
import { PullRequest } from '@tskmgr/common';

@Component({
  selector: 'tskmgr-pull-requests',
  templateUrl: './pull-requests.component.html',
  styleUrls: ['./pull-requests.component.scss'],
})
export class PullRequestsComponent implements OnInit {
  constructor(private readonly pullRequestsService: PullRequestsService) {}

  pullRequests$: Observable<PullRequest[]> = EMPTY;

  ngOnInit(): void {
    this.pullRequests$ = this.pullRequestsService.findAll();
  }
}
