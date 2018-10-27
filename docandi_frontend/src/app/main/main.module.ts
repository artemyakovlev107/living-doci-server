import { RouterModule } from '@angular/router';
import { mainRoutes } from './main.routes';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HelpComponent } from './dashboard/help/help.component';
import { HomeComponent } from './dashboard/home/home.component';
import { MyClinicComponent } from './dashboard/my-clinic/my-clinic.component';
import { MyPharmaciesComponent } from './dashboard/my-pharmacies/my-pharmacies.component';
import { HomeOverviewComponent } from './dashboard/home/home-overview/home-overview.component';
import { HomeMenuleftComponent } from './dashboard/home/home-menuleft/home-menuleft.component';
import { HomeAchievementsComponent } from './dashboard/home/home-achievements/home-achievements.component';
import { HomeReportComponent } from './dashboard/home/home-report/home-report.component';
import { HomeSettingComponent } from './dashboard/home/home-setting/home-setting.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(mainRoutes)
  ],
  declarations: [MainComponent, DashboardComponent, HelpComponent, HomeComponent, MyClinicComponent, MyPharmaciesComponent, HomeOverviewComponent, HomeMenuleftComponent, HomeAchievementsComponent, HomeReportComponent, HomeSettingComponent]
})
export class MainModule { }
