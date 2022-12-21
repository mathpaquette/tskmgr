import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [HeaderComponent, SettingsComponent],
  exports: [HeaderComponent, SettingsComponent],
  imports: [CommonModule],
})
export class TskmgrCommonModule {}
