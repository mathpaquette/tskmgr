import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RunDetailsService } from './run-details.service';
import { Run } from '@tskmgr/common';
import { dateValueFormatter } from '../../common/ag-grid.utils';
import { ValueFormatterParams } from 'ag-grid-community';
import { formatDuration } from '../../common/time.utils';

@Component({
  template: `
    <div class="d-flex flex-column w-100 m-3">
      <div class="accordion" id="accordionRunDetails">
        <!-- DETAILS -->
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              Run details
            </button>
          </h2>
          <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne">
            <div class="accordion-body">
              <table class="table">
                <tbody>
                  <tr *ngFor="let detail of detailsEntries; let i = index">
                    <th scope="row">{{ detail.key | camelCaseToWords }}</th>
                    <td><span [outerHTML]="detail.value | urlify"></span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- INFO -->
        <div class="accordion-item" *ngIf="infoEntries.length > 0">
          <h2 class="accordion-header">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseTwo"
              aria-expanded="false"
              aria-controls="collapseTwo"
            >
              Run info
            </button>
          </h2>
          <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo">
            <div class="accordion-body">
              <table class="table">
                <tbody>
                  <tr *ngFor="let info of infoEntries; let i = index">
                    <th scope="row">{{ info.key }}</th>
                    <td><span [outerHTML]="info.value | urlify"></span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- PARAMETERS -->
        <div class="accordion-item" *ngIf="paramsEntries.length > 0">
          <h2 class="accordion-header" id="headingThree">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseThree"
              aria-expanded="false"
              aria-controls="collapseThree"
            >
              Run parameters
            </button>
          </h2>
          <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree">
            <div class="accordion-body">
              <table class="table">
                <tbody>
                  <tr *ngFor="let param of paramsEntries; let i = index">
                    <th scope="row">{{ param.key }}</th>
                    <td>{{ param.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
      }
    `,
  ],
})
export class RunDetailsDetailsComponent implements OnInit, OnDestroy {
  detailsEntries: { key: string; value: string }[] = [];
  infoEntries: { key: string; value: string }[] = [];
  paramsEntries: { key: string; value: never }[] = [];
  run: Run;

  readonly destroy$ = new Subject<void>();

  constructor(private readonly runDetailsService: RunDetailsService) {}

  ngOnInit(): void {
    this.runDetailsService.run$.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      this.run = x;
      this.setDetails(x);
      this.setInfo(x);
      this.setParameters(x);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setDetails(run: Run): void {
    this.detailsEntries = [];
    Object.entries(run).forEach((x) => {
      const key = x[0];
      let value = x[1];

      if (key === 'parameters' || key == 'info') {
        return;
      }

      if (key === 'duration') {
        value = formatDuration(run.duration);
      }

      if (key === 'createdAt' || key === 'updatedAt' || key === 'endedAt') {
        value = dateValueFormatter({ value } as ValueFormatterParams);
      }

      this.detailsEntries.push({ key, value });
    });
  }

  private setInfo(run: Run): void {
    if (!run.info) {
      return;
    }

    this.infoEntries = [];
    const keys = Object.keys(run.info);
    keys.forEach((key) => {
      const value = run.info[key];
      this.infoEntries.push({ key, value });
    });
  }

  private setParameters(run: Run): void {
    if (!run.parameters) {
      return;
    }

    this.paramsEntries = [];
    const keys = Object.keys(run.parameters);
    keys.forEach((key) => {
      const value = run.parameters[key];
      this.paramsEntries.push({ key, value });
    });
  }
}
