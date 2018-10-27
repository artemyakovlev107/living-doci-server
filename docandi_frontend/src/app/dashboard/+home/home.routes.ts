import { HomeComponent } from './index';
// import {MyAchievementsComponent} from "./+my-achievements/my-achievements";
// import {HomeOverviewComponent} from "./+home-overview/home-overview.component";
// import {ProgressReportComponent} from "./+progress-report/progress-report";

export const DashboardHomeRoutes = [
	{
		path: 'home',
		component: HomeComponent,
		// children: [
		// 	{
		// 		path: 'my-achievements',
		// 		component: MyAchievementsComponent
		// 	},
		// 	{
		// 		path: 'overview',
		// 		component: HomeOverviewComponent
		// 	},
		// 	{path: 'progress-report', component: ProgressReportComponent},
        // ]
	},
];