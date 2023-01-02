import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tskmgr-settings',
  template: `
    <div class="container-fluid mt-2">
      <nav
        style="--bs-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='currentColor'/%3E%3C/svg%3E&#34;);"
        aria-label="breadcrumb"
      >
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/runs">Runs</a></li>
          <li class="breadcrumb-item active" aria-current="page">Settings</li>
        </ol>
      </nav>

      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page">Preferences</a>
        </li>
      </ul>

      <div class="row m-2">
        <form>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" disabled="true" checked />
            <label class="form-check-label" for="flexCheckDefault"> Auto-refresh</label>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [],
})
export class SettingsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
