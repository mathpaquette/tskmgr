import { TestBed } from '@angular/core/testing';

import { PullRequestsService } from './pull-requests.service';

describe('PullRequestsService', () => {
  let service: PullRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PullRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
