import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router, RouterEvent } from '@angular/router';
import { BehaviorSubject, filter, interval, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  readonly searchEnable$: Observable<boolean>;
  readonly refreshData$: Observable<number>;

  readonly _search = new BehaviorSubject<string>('');
  readonly search$: Observable<string> = this._search.asObservable();

  constructor(
    private router: Router, //
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.queryParamMap
      .pipe(
        map((x) => {
          const search = x.get('search');
          if (search) {
            return search;
          }
          return '';
        }),
        tap((x) => this._search.next(x))
      )
      .subscribe();

    this.searchEnable$ = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((x) => x.url === '' || x.url === '/runs' || x.url.startsWith('/runs?'))
    );

    this.refreshData$ = interval(1000 * 10);
  }

  setSearch(name: string): Promise<boolean> {
    const queryParams: Params = name === '' ? {} : { search: name };
    return this.router.navigate([], { queryParams, replaceUrl: true });
  }
}
