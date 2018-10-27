import { HomeSettingComponent } from './dashboard/home/home-setting/home-setting.component';
import { HomeReportComponent } from './dashboard/home/home-report/home-report.component';
import { HomeOverviewComponent } from './dashboard/home/home-overview/home-overview.component';
import { HomeAchievementsComponent } from './dashboard/home/home-achievements/home-achievements.component';
import { MyPharmaciesComponent } from './dashboard/my-pharmacies/my-pharmacies.component';
import { MyClinicComponent } from './dashboard/my-clinic/my-clinic.component';
import { HelpComponent } from './dashboard/help/help.component';
import { HomeComponent } from './dashboard/home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainComponent } from './main.component';

import { Routes } from '@angular/router';
export const mainRoutes: Routes = [
    {
        path: '', component: MainComponent, children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard', component: DashboardComponent, children: [
                    { path: '', redirectTo: 'home', pathMatch: 'full' },
                    {
                        path: 'home', component: HomeComponent, children: [
                            {path:'',redirectTo:'overview',pathMatch:'full'},
                            {path:'achievements',component:HomeAchievementsComponent},
                            {path:'overview',component:HomeOverviewComponent},
                            {path:'report',component:HomeReportComponent},
                            {path:'setting',component:HomeSettingComponent}
                        ]
                    },
                    { path: 'help', component: HelpComponent },
                    { path: 'my-clinic', component: MyClinicComponent },
                    { path: 'my-pharmacies', component: MyPharmaciesComponent }
                ]
            }
        ]
    }
]


