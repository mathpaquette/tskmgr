import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivationStart, Params, Router } from '@angular/router';
import { BehaviorSubject, filter, interval, map, Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  readonly refreshData$: Observable<number>;

  readonly _search = new BehaviorSubject<string>('');
  readonly search$: Observable<string> = this._search.asObservable();

  readonly _searchEnabled = new Subject<boolean>();
  readonly searchEnable$ = this._searchEnabled.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
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

    this.router.events
      .pipe(filter((event): event is ActivationStart => event instanceof ActivationStart))
      .subscribe(() => this._searchEnabled.next(false));

    this.refreshData$ = interval(1000 * 10);
  }

  setSearch(name: string): Promise<boolean> {
    const queryParams: Params = name === '' ? {} : { search: name };
    return this.router.navigate([], { queryParams, replaceUrl: true });
  }

  enableSearch(): void {
    this._searchEnabled.next(true);
  }
}
