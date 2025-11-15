import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'tskmgr-root',
  template: `
    <tskmgr-header></tskmgr-header>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
    `,
  ],
})
export class AppComponent {
  title = 'frontend';
}
