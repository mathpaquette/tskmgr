import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tskmgr-header',
  template: `
    <nav class="navbar navbar-expand-sm navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">tskmgr</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div class="navbar-nav">
            <a class="nav-link" routerLinkActive="active" routerLink="/pull-requests">Pull Requests</a>
            <a class="nav-link" routerLinkActive="active" routerLink="/runs">Runs</a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [``],
})
export class HeaderComponent {}
