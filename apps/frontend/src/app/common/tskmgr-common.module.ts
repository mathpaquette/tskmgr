import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SettingsComponent } from './settings/settings.component';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CamelCaseToWordsPipe } from './camel-case.pipe';
import { UrlifyPipe } from './urlify.pipe';

@NgModule({
  declarations: [HeaderComponent, SettingsComponent, CamelCaseToWordsPipe, UrlifyPipe],
  exports: [HeaderComponent, SettingsComponent, CamelCaseToWordsPipe, UrlifyPipe],
  imports: [
    CommonModule, //
    RouterLink,
    FormsModule,
    NgbTooltipModule,
    RouterLinkActive,
  ],
})
export class TskmgrCommonModule {}
