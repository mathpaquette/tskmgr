import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunsComponent } from './runs.component';
import { provideRouter } from '@angular/router';
import { RunsService } from './runs.service';
import { MockComponent } from 'ng-mocks';
import { AgGridAngular } from 'ag-grid-angular';

describe('RunsComponent', () => {
  let component: RunsComponent;
  let fixture: ComponentFixture<RunsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunsComponent],
      providers: [
        {
          provide: RunsService,
          useValue: { findAll: vi.fn() },
        },
        provideRouter([]),
      ],
    })
      .overrideComponent(RunsComponent, {
        remove: { imports: [AgGridAngular] },
        add: { imports: [MockComponent(AgGridAngular)] },
      })
      .compileComponents();
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
