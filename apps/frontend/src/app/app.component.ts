import { Component } from '@angular/core';
import { HeaderComponent } from './common/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
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
  imports: [HeaderComponent, RouterOutlet],
})
export class AppComponent {
  title = 'frontend';
}
