import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ToolbarComponent } from './toolbar/toolbar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { NameListService } from './name-list/name-list.service';
import { TopNavComponent } from "./topnav/topnav";
import { TranslateModule } from "ng2-translate";
import { TooltipComponent } from './tooltip/tooltip.component';
import { MapFileComponent } from './components/map-file/map-file.component';

/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  declarations: [ToolbarComponent, NavbarComponent, TopNavComponent, TooltipComponent, MapFileComponent],
  exports: [ToolbarComponent, NavbarComponent, TopNavComponent,
    CommonModule, FormsModule, RouterModule, TranslateModule, TooltipComponent, MapFileComponent]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [NameListService]
    };
  }
}
