import { Component, OnInit } from '@angular/core';
import { RunsService } from '../runs.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Run } from '@tskmgr/common';

@Component({
  selector: 'tskmgr-run-details',
  template: `
    <div class="container">
      <p>{{ run.name }}</p>

      <ngb-accordion activeIds="static-1">
        <ngb-panel id="static-1" title="Details">
          <ng-template ngbPanelContent>
            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon
            officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3
            wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et.
            Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan
            excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt
            you probably haven't heard of them accusamus labore sustainable VHS.
          </ng-template>
        </ngb-panel>
        <ngb-panel id="static-2" title="Tasks">
          <ng-template ngbPanelContent>
            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon
            officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3
            wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et.
            Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan
            excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt
            you probably haven't heard of them accusamus labore sustainable VHS.
          </ng-template>
        </ngb-panel>
        <ngb-panel id="static-3" title="Files">
          <ng-template ngbPanelContent>
            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon
            officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3
            wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et.
            Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan
            excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt
            you probably haven't heard of them accusamus labore sustainable VHS.
          </ng-template>
        </ngb-panel>
      </ngb-accordion>
    </div>
  `,
  styleUrls: ['./run-details.component.scss'],
})
export class RunDetailsComponent implements OnInit {
  constructor(private runService: RunsService, private activatedRoute: ActivatedRoute) {}

  run: Run;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((x) => {
      const id = x.get('id');
      if (!id) {
        return;
      }

      this.fetchData(Number(id));
    });
  }

  async fetchData(id: number): Promise<void> {
    this.run = await firstValueFrom(this.runService.findById(id));
    console.log(this.run);
  }
}

interface Test {
  id: number;
}
