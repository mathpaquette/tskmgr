import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunsComponent } from './runs.component';
import { RouterTestingModule } from '@angular/router/testing';
import { RunsService } from './runs.service';
import { MockComponents } from 'ng-mocks';
import { AgGridAngular } from 'ag-grid-angular';

describe('RunsComponent', () => {
  let component: RunsComponent;
  let fixture: ComponentFixture<RunsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: RunsService,
          useValue: { findAll: jest.fn() },
        },
      ],
      declarations: [RunsComponent, MockComponents(AgGridAngular)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
