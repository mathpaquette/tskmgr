import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksComponent } from './tasks.component';
import { HttpClient } from '@angular/common/http';
import { API_URL_TOKEN } from '../../common/api-url.token';
import { RouterTestingModule } from '@angular/router/testing';

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: HttpClient, useValue: { get: jest.fn() } },
        { provide: API_URL_TOKEN, useValue: { createTasksUrl: jest.fn() } },
      ],
      declarations: [TasksComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
