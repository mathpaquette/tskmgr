import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { RunDetailsService } from './run-details.service';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import TimelinesChart, { Line, TimelinesChartInstance } from 'timelines-chart';
import { round } from 'lodash';

@Component({
  template: `
    <div class="m-2">
      <div #chart id="timelines-chart"></div>
    </div>
  `,
  styles: [``],
})
export class RunDetailsExecutionComponent implements OnDestroy, AfterViewInit {
  readonly destroy$ = new Subject<void>();

  @ViewChild('chart') private el: ElementRef;
  private timelinesChart: TimelinesChartInstance;

  constructor(private readonly runDetailsService: RunDetailsService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.timelinesChart.width(event.target.innerWidth);
  }

  ngAfterViewInit() {
    this.timelinesChart = TimelinesChart()(this.el.nativeElement);
    this.timelinesChart.rightMargin(300);

    this.runDetailsService.tasks$.pipe(takeUntil(this.destroy$)).subscribe(async (tasks) => {
      const run = await firstValueFrom(this.runDetailsService.run$);

      this.timelinesChart.data([
        {
          group: 'tasks',
          data: tasks.map<Line>((x) => {
            return {
              label: x.command,
              data: [
                {
                  timeRange: [new Date(x.startedAt), new Date(x.endedAt)],
                  val: round(run.duration ? x.duration / run.duration : x.duration, 2),
                },
              ],
            };
          }),
        },
      ]);
      this.timelinesChart.refresh();
    });
  }
}
