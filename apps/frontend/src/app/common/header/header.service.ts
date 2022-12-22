import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { interval, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  readonly search$: Observable<string>;
  readonly refreshData$: Observable<number>;

  constructor(
    private router: Router, //
    private activatedRoute: ActivatedRoute
  ) {
    this.search$ = this.activatedRoute.queryParamMap.pipe(
      map((x) => {
        const search = x.get('search');
        if (search) {
          return search;
        }
        return '';
      })
    );

    this.refreshData$ = interval(1000 * 10);
  }

  setSearch(name: string): Promise<boolean> {
    const queryParams: Params = name === '' ? {} : { search: name };
    return this.router.navigate([], { queryParams, replaceUrl: true });
  }
}
