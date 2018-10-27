import { AuthGuard } from './../shared/services/auth.gaurd';
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './+home/index';
import { HomeOverviewComponent } from './+home/+home-overview/home-overview.component';
import { MyAchievementsComponent } from './+home/+my-achievements/my-achievements';
// import {ClinicStatsComponent} from './+clinic-stats/clinic-stats.component';
import {HelpComponent} from './+help/help.component';
import {MyClinicComponent} from './+my-clinic/my-clinic.component';
import {MyPharmaciesComponent} from './+my-pharmacies/index';
import {AccountSettingsComponent} from "./+setting/account-settings.component";
import {ProgressReportComponent} from "./+progress-report/progress-report";
export const DashboardRoutes: Routes = [
	{
		path: 'dashboard',
		component: DashboardComponent,
		children: [
			{
				path: 'home/overview',
				component: HomeOverviewComponent,
				// children: [
				// 	{path: 'overview', component:HomeOverviewComponent},
				// 	{path: 'my-achievements', component: MyAchievementsComponent},
				// 	{path: 'account-settings',component: AccountSettingsComponent},
				// 	{path: 'progress-report', component: ProgressReportComponent},

				// ]
			},
			{
				path: 'help',
				component: HelpComponent
			},
			{
				path: 'account-settings',
				component: AccountSettingsComponent
			},
			{
				path: 'progress-report',
				component: ProgressReportComponent
			},
			{
				path: 'my-clinic',
				component: MyClinicComponent
			},
			{
				path: 'my-pharmacies',
				component: MyPharmaciesComponent
			}

       ],canActivate:[AuthGuard]
	},
];