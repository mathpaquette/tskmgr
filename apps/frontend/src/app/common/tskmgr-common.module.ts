import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SettingsComponent } from './settings/settings.component';
import { RouterLinkActive, RouterLinkWithHref } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CamelCaseToWordsPipe } from './camel-case.pipe';

@NgModule({
  declarations: [HeaderComponent, SettingsComponent, CamelCaseToWordsPipe],
  exports: [HeaderComponent, SettingsComponent, CamelCaseToWordsPipe],
  imports: [
    CommonModule, //
    RouterLinkWithHref,
    FormsModule,
    NgbTooltipModule,
    RouterLinkActive,
  ],
})
export class TskmgrCommonModule {}
