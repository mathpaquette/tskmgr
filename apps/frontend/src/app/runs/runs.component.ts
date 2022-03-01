import { Component } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { Run } from '@tskmgr/common';
import { RunsService } from './runs.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'tskmgr-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.scss'],
})
export class RunsComponent {
  constructor(private readonly runsService: RunsService, private activatedRoute: ActivatedRoute, private router: Router) {}

  runs$: Observable<Run[]> = EMPTY;
  id = '';

  ngOnInit(): void {
    this.runs$ = this.runsService.findAll();
    this.id = this.activatedRoute.snapshot.params['id'];
  }

  onRowClick(run: Run): void {
    this.id = run._id;
    this.router.navigate(['runs', run._id]);
  }
}
