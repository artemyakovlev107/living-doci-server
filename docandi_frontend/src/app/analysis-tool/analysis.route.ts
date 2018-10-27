import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AnalysisComponent} from "./analysis.component";
import {MAPerformanceComponent} from "./MA-performance/MA-performance.component";
import {Three40BMetricComponent} from "./+340BMetric/340BMetric.component";
import {SoftwareUsageComponent} from "./Software-Usage/Software-Usage.component";

export const AnalysisRoutes: Routes = [
	{
		path: 'analysis',
		component: AnalysisComponent,
		children: [
			{
				path: 'MA',
				component: MAPerformanceComponent
			},
			{
				path: 'Three40BMetric',
				component: Three40BMetricComponent
			},
			{
				path: 'Software-Usage',
				component: SoftwareUsageComponent
			}

		]
	},
];