import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tskmgr-header',
  template: `
    <!--    <nav class="navbar navbar-expand-sm navbar-dark bg-dark">-->
    <!--      <div class="container-fluid">-->
    <!--        <a class="navbar-brand" href="https://github.com/mathpaquette/tskmgr">tskmgr</a>-->
    <!--        <button-->
    <!--          class="navbar-toggler"-->
    <!--          type="button"-->
    <!--          data-bs-toggle="collapse"-->
    <!--          data-bs-target="#navbarNavAltMarkup"-->
    <!--          aria-controls="navbarNavAltMarkup"-->
    <!--          aria-expanded="false"-->
    <!--          aria-label="Toggle navigation"-->
    <!--        >-->
    <!--          <span class="navbar-toggler-icon"></span>-->
    <!--        </button>-->
    <!--        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">-->
    <!--          <div class="navbar-nav">-->
    <!--            <a class="nav-link" routerLinkActive="active" routerLink="/runs">Runs</a>-->
    <!--          </div>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </nav>-->

    <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="https://github.com/mathpaquette/tskmgr">tskmgr</a>
        <button
          class="navbar-toggler collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="navbar-collapse collapse" id="navbarCollapse" style="">
          <ul ngbNav class="navbar-nav me-auto mb-2 mb-md-0">
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="/runs">Runs</a>
            </li>
            <!--        <li class="nav-item">-->
            <!--          <a class="nav-link" href="#">Link</a>-->
            <!--        </li>-->
            <!--        <li class="nav-item">-->
            <!--          <a class="nav-link disabled">Disabled</a>-->
            <!--        </li>-->
          </ul>
          <form class="d-flex" role="search">
            <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
            <button class="btn btn-outline-success" type="submit">Search</button>
          </form>
        </div>
      </div>
    </nav>

    <!--&lt;!&ndash; your navs bound to current route fragments &ndash;&gt;-->
    <!--<ul ngbNav [activeId]="route.fragment | async" class="nav-tabs">-->
    <!--  <li [ngbNavItem]="link.fragment" *ngFor="let link of links">-->
    <!--    <a ngbNavLink routerLink="." [fragment]="link.fragment">{{ link.title }}</a>-->
    <!--  </li>-->
    <!--</ul>-->
  `,
  styles: [``],
})
export class HeaderComponent {}
