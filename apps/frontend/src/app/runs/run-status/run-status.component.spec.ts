import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunStatusComponent } from './run-status.component';

describe('RunStatusComponent', () => {
  let component: RunStatusComponent;
  let fixture: ComponentFixture<RunStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RunStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RunStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
