import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { DoughnutChartComponent } from './doughnut-chart/doughnut-chart.component';
import { ChartsModule } from 'ng2-charts';
import { MBarchartComponent } from './m-barchart/m-barchart.component';

@NgModule({
	imports: [
		CommonModule,
		ChartsModule
	],
	exports: [
		BarChartComponent,
		DoughnutChartComponent,
	],
	declarations: [
		BarChartComponent,
		DoughnutChartComponent,
		MBarchartComponent,
	]
})
export class WidgetChartsModule {}
