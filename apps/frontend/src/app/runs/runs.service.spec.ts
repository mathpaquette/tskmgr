import { TestBed } from '@angular/core/testing';

import { RunsService } from './runs.service';
import { HttpClient } from '@angular/common/http';
import { API_URL_TOKEN } from '../common/api-url.token';

describe('RunsService', () => {
  let service: RunsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: { get: jest.fn() } },
        { provide: API_URL_TOKEN, useValue: { createTasksUrl: jest.fn() } },
      ],
    });
    service = TestBed.inject(RunsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
