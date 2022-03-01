import { Component } from '@angular/core';

@Component({
  selector: 'tskmgr-root',
  template: `
    <tskmgr-header></tskmgr-header>
    <router-outlet></router-outlet>
  `,
  styles: [``],
})
export class AppComponent {
  title = 'frontend';
}
