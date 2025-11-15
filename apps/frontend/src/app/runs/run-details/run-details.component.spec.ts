import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunDetailsComponent } from './run-details.component';
import { MockComponent, MockComponents, MockModule } from 'ng-mocks';
import { AgGridAngular } from 'ag-grid-angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { API_URL_TOKEN } from '../../common/api-url.token';
import { RouterTestingModule } from '@angular/router/testing';
import { TskmgrCommonModule } from '../../common/tskmgr-common.module';
import { RunStatusComponent } from '../run-status/run-status.component';

describe('RunDetailsComponent', () => {
  let component: RunDetailsComponent;
  let fixture: ComponentFixture<RunDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MockModule(TskmgrCommonModule),
        MockComponent(AgGridAngular),
      ],
      declarations: [RunDetailsComponent, MockComponent(RunStatusComponent)],
      providers: [{ provide: API_URL_TOKEN, useValue: { getRunUrl: vi.fn() } }],
    }).compileComponents();

    fixture = TestBed.createComponent(RunDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
