import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RunDetailsService } from './run-details.service';
import { Run } from '@tskmgr/common';

@Component({
  template: `
    <div class="d-flex flex-column w-100 m-3">
      <div class="accordion" id="accordionExample">
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingOne">
            <button
              class="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              Run information
            </button>
          </h2>
          <div
            id="collapseOne"
            class="accordion-collapse collapse show"
            aria-labelledby="headingOne"
            data-bs-parent="#accordionExample"
          >
            <div class="accordion-body">
              <table class="table">
                <tbody>
                  <tr *ngFor="let info of infoEntries; let i = index">
                    <th scope="row">{{ info.key | camelCaseToWords }}</th>
                    <td>{{ info.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingTwo">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseTwo"
              aria-expanded="false"
              aria-controls="collapseTwo"
            >
              Run parameters
            </button>
          </h2>
          <div
            id="collapseTwo"
            class="accordion-collapse collapse"
            aria-labelledby="headingTwo"
            data-bs-parent="#accordionExample"
          >
            <div class="accordion-body">
              <table class="table">
                <tbody>
                  <tr *ngFor="let param of paramEntries; let i = index">
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
  infoEntries: { key: string; value: string }[] = [];
  paramEntries: { key: string; value: never }[] = [];
  run: Run | undefined;

  readonly destroy$ = new Subject<void>();

  constructor(private readonly runDetailsService: RunDetailsService) {}

  ngOnInit(): void {
    this.runDetailsService.run$.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      if (!x) {
        return;
      }

      this.run = x;
      this.setInformation(x);
      this.setParameters(x);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setInformation(run: Run): void {
    this.infoEntries = [];
    Object.entries(run).forEach((x) => {
      let key = x[0];
      let value = x[1];

      if (key === 'parameters') {
        return;
      }

      if (key === 'files' || key === 'tasks') {
        key = `${key}Count`;
        value = value.length;
      }

      this.infoEntries.push({ key, value });
    });
  }

  private setParameters(run: Run): void {
    this.paramEntries = [];
    const keys = Object.keys(run.parameters);
    keys.forEach((key) => {
      const value = run.parameters[key];
      this.paramEntries.push({ key, value });
    });
  }
}
