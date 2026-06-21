import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunDetailsComponent } from './run-details.component';
import { MockComponent } from 'ng-mocks';
import { RouterTestingModule } from '@angular/router/testing';
import { RunStatusComponent } from '../run-status/run-status.component';
import { RunDetailsService } from './run-details.service';
import { of } from 'rxjs';

describe('RunDetailsComponent', () => {
  let component: RunDetailsComponent;
  let fixture: ComponentFixture<RunDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, RunDetailsComponent],
    })
      .overrideComponent(RunDetailsComponent, {
        remove: {
          imports: [RunStatusComponent],
          providers: [RunDetailsService],
        },
        add: {
          imports: [MockComponent(RunStatusComponent)],
          providers: [{ provide: RunDetailsService, useValue: { run$: of({ name: 'test' }) } }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RunDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
