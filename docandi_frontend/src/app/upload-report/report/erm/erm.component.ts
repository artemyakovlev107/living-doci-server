import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonDataService } from './../../../shared/services/common-data.service';
import { UploadServiceService } from './../../upload-service.service';

declare const Highcharts: any;
import * as moment from 'moment';
@Component({
  selector: 'app-erm',
  templateUrl: './erm.component.html',
  styleUrls: ['./erm.component.css']
})
export class ErmComponent implements OnInit {


  fromDate: any;
  prescriberData: any;
  typeChart5 = 'total';
  netRevenueData: any;
  totalRevenueData: any;
  totalRx: any = 0;
  totalPatientSaving: any = 0;
  totalRevenue: any = 0;
  pharmacySumary: any;
  contracted: any;
  noncontracted: any;
  rateContracted: any;
  range_date: any = 12;
  constructor(private service: UploadServiceService, private commonService: CommonDataService, private router: Router) { 
    this.fromDate = new Date('2018-1-1');
  }
  ngOnInit() {
    this.fromDate = new Date('2018-1-1');
    this.getDataERM(this.fromDate, this.range_date)
  }
  ngAfterViewInit() {

  }
  getDataERM = (from: any, range_date: any) => {
    from = moment(from).format('YYYY-MM-DD');
    this.service.getErmData(from, range_date).subscribe((data) => {
      if (data.Status == "access is denied") {
        localStorage.clear();
        this.router.navigate(['/', 'login']);
      } else {
        let result: any = data.Data;
        this.contracted = Number(result.contracted);
        this.noncontracted  = Number(result.Noncontracted);
        this.rateContracted = Number((this.contracted / (this.contracted + this.noncontracted)).toFixed(2)) * 100;
        this.initchartContract(result.contracted, this.noncontracted);
        result.pharmacyBreakdown.sort((a:any, b:any) => {
          return b.y - a.y;
        });
        this.initChartPharmacy(result.pharmacyBreakdown)
        this.pharmacySumary = result.pharmacySumary;
        console.log(data);
      }
    })
  }
  initchartContract(contracted: any, noncontracted: any) {
    contracted = Number(contracted);
    noncontracted = Number(noncontracted);
    Highcharts.chart('chart-contract', {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        width: 294,
        height: 334,
        backgroundColor: 'transparent'
        //plotShadow: false
      },
      pie: {
        size: 100
      },
      title: {
        text: 'Contract Capture Rate'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y}</b>',
      },
      plotOptions: {
        pie: {
          size: 210,
          center: ['50%', '40%'],
          dataLabels: {
            enabled: false
          },
          showInLegend: true
        }
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'vertical',
        title: { text: '' },
        itemStyle: {
          fontWeight: 'normal',
          fontSize: '18px'
        },
        symbolWidth: 12,
        symbolRadius: 6,
        enabled: true,
        labelFormatter: function () {
          return '(' + this.rate + '%) ' + this.name + ' (' + this.y + ')';
        }
      },
      series: [{
        type: 'pie',
        name: 'Quantity',
        innerSize: '70%',
        data: [
          { name: 'Contracted', y: contracted, rate: this.rateContracted },
          { name: 'Non Contracted', y: noncontracted, rate: 100 - this.rateContracted },
        ]
      }]
    });
  }
  initChartPharmacy(data: any) {
    for (let i = 0; i < data.length; i++) {
      data[i].name = data[i].pharmacy;
    }
    console.log(data)
    Highcharts.chart('chart-pharmacy', {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: 'Pharmacy Breakdown'
      },
      tooltip: {
        pointFormat: '<b>{point.y}</b>',
      },
      legend: {
        enabled: true,
        labelFormatter: function () {
          return this.name + " (" + this.percentage.toFixed(2) + "%)";
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          showInLegend: true,
          dataLabels: {
            enabled: false,
            format: '{point.percentage:.1f} %',
            distance: -50,
            filter: {
              property: 'percentage',
              operator: '>',
              value: 4
            }
          }
        }
      },
      series: [{
        showInLegend: true,
        colorByPoint: true,
        data: data
      }]
    });
  }
  changeDate() {
    // this.getData(this.fromDate, this.range_date)
    this.getDataERM(this.fromDate, this.range_date)
  }

}
