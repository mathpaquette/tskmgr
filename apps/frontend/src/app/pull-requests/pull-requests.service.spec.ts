import { TestBed } from '@angular/core/testing';

import { PullRequestsService } from './pull-requests.service';
import { HttpClient } from '@angular/common/http';
import { API_URL_TOKEN } from '../common/api-url.token';

describe('PullRequestsService', () => {
  let service: PullRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: jest.fn() },
        { provide: API_URL_TOKEN, useValue: jest.fn() },
      ],
    });
    service = TestBed.inject(PullRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
