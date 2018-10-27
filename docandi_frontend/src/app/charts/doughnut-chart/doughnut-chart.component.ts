import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'm-doughnut-chart',
	templateUrl: './doughnut-chart.component.html',
	styleUrls: ['./doughnut-chart.component.scss']
})
export class DoughnutChartComponent implements OnInit {
	// Doughnut
	public doughnutChartLabels: string[] = ['Using Contract', 'Switched', 'Did not Switch'];
	public doughnutChartData: number[] = [150, 300, 150];
	public doughnutChartType: string = 'doughnut';
	public chartColors: any[] = [
		{ 
		  backgroundColor:["#f4516c", "#34bfa3", "#36a3f7"] 
		}];
	constructor () { }

	ngOnInit () {
	}

	// events
	chartClicked (e: any): void {
	}

	chartHovered (e: any): void {
	}

}
