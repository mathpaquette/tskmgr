import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SettingsComponent } from './settings/settings.component';
import { RouterLinkActive, RouterLinkWithHref } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [HeaderComponent, SettingsComponent],
  exports: [HeaderComponent, SettingsComponent],
  imports: [
    CommonModule, //
    RouterLinkWithHref,
    FormsModule,
    NgbTooltipModule,
    RouterLinkActive,
  ],
})
export class TskmgrCommonModule {}
