import { Component, OnInit } from '@angular/core';
import { RunsService } from '../runs.service';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { Task } from '@tskmgr/common';

@Component({
  selector: 'tskmgr-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit {
  constructor(private readonly runsService: RunsService, private activatedRoute: ActivatedRoute) {}

  id = '';
  tasks$: Observable<Task[]> = EMPTY;

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.tasks$ = this.runsService.findTasks(this.id);
  }
}
