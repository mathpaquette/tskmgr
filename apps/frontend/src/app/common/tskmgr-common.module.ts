import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SettingsComponent } from './settings/settings.component';
import {RouterLinkWithHref} from "@angular/router";

@NgModule({
  declarations: [HeaderComponent, SettingsComponent],
  exports: [HeaderComponent, SettingsComponent],
    imports: [CommonModule, RouterLinkWithHref],
})
export class TskmgrCommonModule {}
