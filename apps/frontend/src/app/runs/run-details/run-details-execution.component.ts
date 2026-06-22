import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, inject, viewChild } from '@angular/core';
import { RunDetailsService } from './run-details.service';
import { Subject, takeUntil } from 'rxjs';
import TimelinesChart, { Group, Line } from 'timelines-chart';
import TimelinesChartInstance from 'timelines-chart';
import { groupBy, orderBy } from 'lodash-es';
import { scaleOrdinal } from 'd3-scale';
import { TaskStatus } from '@tskmgr/common';

const valColorScale: (domain: string) => unknown = scaleOrdinal()
  .domain([TaskStatus.Running, TaskStatus.Completed, TaskStatus.Failed, TaskStatus.Aborted])
  .range(['blue', 'green', 'red', 'black']);

@Component({
  template: `
    <div class="m-2 timeline-container">
      @if (!hasTimelineData) {
        <div class="text-muted">No execution timeline available.</div>
      }
      <div #chart id="timelines-chart" [class.d-none]="!hasTimelineData"></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
        min-width: 0;
      }

      .timeline-container {
        flex: 1;
        min-width: 0;
      }
    `,
  ],
})
export class RunDetailsExecutionComponent implements OnDestroy, AfterViewInit {
  private readonly runDetailsService = inject(RunDetailsService);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly destroy$ = new Subject<void>();
  hasTimelineData = true;

  private readonly chart = viewChild.required<ElementRef<HTMLElement>>('chart');
  private timelinesChart?: TimelinesChartInstance;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateChartWidth();
  }

  ngAfterViewInit() {
    this.runDetailsService.tasks$.pipe(takeUntil(this.destroy$)).subscribe((tasks) => {
      const orderedTasks = orderBy(
        tasks.filter((x) => this.isValidDate(x.startedAt)),
        (x) => new Date(x.startedAt as Date).getTime(),
      );

      if (orderedTasks.length === 0) {
        this.hasTimelineData = false;
        this.chart().nativeElement.replaceChildren();
        this.timelinesChart = undefined;
        return;
      }

      this.hasTimelineData = true;
      this.ensureChart();
      const tasksByCommand = groupBy(orderedTasks, (x) => x.command);

      const timelineData: Group[] = [
        {
          group: 'tasks',
          data: orderedTasks.map<Line>((x) => {
            const endedAt = this.isValidDate(x.endedAt) ? x.endedAt : new Date();

            return {
              // if we found duplicated commands, just add id of the task
              label: tasksByCommand[x.command].length > 1 ? `${x.command} #${x.id}` : x.command,
              data: [
                {
                  timeRange: [new Date(x.startedAt as Date), new Date(endedAt as Date)],
                  val: x.status,
                },
              ],
            };
          }),
        },
      ];

      this.updateChartWidth();
      this.timelinesChart?.data(timelineData);
      this.timelinesChart?.refresh();
    });
  }

  private ensureChart(): void {
    if (this.timelinesChart) {
      return;
    }

    this.timelinesChart = new TimelinesChart(this.chart().nativeElement);
    this.timelinesChart.rightMargin(300);
    this.timelinesChart.width(this.getChartWidth());
    this.timelinesChart.zColorScale(valColorScale as never);
  }

  private updateChartWidth(): void {
    this.timelinesChart?.width(this.getChartWidth());
  }

  private getChartWidth(): number {
    const width = this.el.nativeElement.getBoundingClientRect().width || this.el.nativeElement.offsetWidth;
    return Math.max(480, Math.floor(width));
  }

  private isValidDate(value: unknown): boolean {
    return !!value && !Number.isNaN(new Date(value as Date).getTime());
  }
}
