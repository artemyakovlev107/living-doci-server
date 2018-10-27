import { Router } from '@angular/router';
import { CommonDataService } from './../../../shared/services/common-data.service';
import { UploadServiceService } from './../../upload-service.service';
import { Component, OnInit } from '@angular/core';
// import {DatePickerComponent} from 'ng2-date-picker';
declare const Highcharts: any;
import * as moment from 'moment';
@Component({
  selector: 'app-finacial',
  templateUrl: './finacial.component.html',
  styleUrls: ['./finacial.component.css']
})
export class FinacialComponent implements OnInit {

  constructor(private service: UploadServiceService, private commonService: CommonDataService, private router: Router) { }
  fromDate: any = new Date('2018-1-1');
  range_date:any = 12;
  prescriberData: any = [];
  typeChart5 = 'total';
  netRevenueData: any;
  totalRevenueData: any;
  totalRx: any = 0;
  totalPatientSaving: any = 0;
  totalRevenue: any = 0;
  monthNumber:any;
  averageTotalRevenue:any;
  averageNetRevenue:any;
  ngOnInit() {
    // this.fromDate = new Date('2018-1-1');
    this.getData(this.fromDate, this.range_date)
  }
  ngAfterViewInit() {
    this.initChart5(null);
    this.initChartSaving(null);
    this.initchartContact(null);
  }
  initChart5(data: any, type?: any) {
    // 'December 2017', 'January 2018', 'February 2018'
    let time = ['Baseline'];
    let chartData: any = [];
    if (data) {
      for (let i = 1; i < data.length; i++) {
        time.push(data[i].time)
      }
      for (let i = 0; i < data.length; i++) {
        chartData.push(Number(data[i][type]));
      }
    }
    Highcharts.chart('chart5', {
      chart: {
        type: 'line'
      },
      title: {
        text: `$${this.averageTotalRevenue} | $${this.averageNetRevenue} average revenue for ${this.monthNumber} months`
      },
      subtitle: {
        // text: `$${this.averageTotalRevenue} | $${this.averageNetRevenue} average revenue for ${this.monthNumber} months`
      },
      xAxis: {
        categories: time
      },
      yAxis: {
        title: {
          text: ' '
        },
        labels: {
          formatter: function () {
            return ' $' + this.value.toLocaleString('en-us');
          }
        }
      },
      tooltip: {
        pointFormat: "Value: {point.y:.2f} mm"
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true,
            formatter: function () {
              return '$' + this.y.toLocaleString('en-us')
            }
          },
          enableMouseTracking: false
        }
      },
      series: [{
        name: 'data',
        data: chartData
      }]
    });
  }
  initChartSaving(data: any) {
    Highcharts.chart('chart-saving', {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Uninsured Patient Saving'
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: ''
        },
        labels: {
          formatter: function () {
            return '';
          }
        }
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            formatter: function () {
              return '$' + this.y.toFixed(2);
            }
          }
        }
      },

      tooltip: {
        headerFormat: '',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>${point.y:.2f}</b><br/>',
        formatter: function () {
          return `${this.key}: $${this.y.toFixed(2)}`;
        }
      },

      "series": [
        {
          "colorByPoint": true,
          "data": [
            {
              "name": "Total Patient Savings",
              "y": data ? Number(data.totalPatientSaving) : 0
            },
            {
              "name": "Average Patient Savings Per Rx",
              "y": data ? Number(data.Average) : 0
            }
          ]
        }
      ],

    });
  }
  initchartContact(data: any) {
    let test = [];
    if (data) {

      for (let i = 0; i < data.length; i++) {
        test[i] = {
          name: data[i].pharmacy_location,
          y: Number(data[i].percent)
        }
      }
      console.log(test)
    }

    Highcharts.chart('chart-contact', {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: 'Contract Pharmacy Rx Breakdown'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        y: 5,
        padding: 50
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false
          },
          showInLegend: true
        }
      },
      series: [{
        name: 'Brands',
        colorByPoint: true,
        data: test
      }]
    });
  }
  changeDate() {
    // console.log(this.toDate)
    // console.log(this.range_date)
    this.getData(this.fromDate, this.range_date)
  }
  getData(fromDate: any, range_date: any) {
    this.commonService.toggleLoading(true);
    let formatData: any = [];
    fromDate = moment(fromDate).format('YYYY-MM-DD');
    this.service.getPrescriberdata(fromDate, range_date).subscribe((res) => {
      this.commonService.toggleLoading(false);
      if (res.Status == "access is denied") {
        localStorage.clear();
        this.router.navigate(['/', 'login']);
      } else {
        let data: any = res.Data;
        if (data) {
          this.initChartSaving(data.patientSavingData)
          if (data.pharmacyData.length > 0) {
            this.initchartContact(data.pharmacyData);
          }
          this.prescriberData = data.prescriberData;
          this.netRevenueData = data.netRevenueData;
          this.totalRevenueData = data.totalRevenueData;
          this.totalRx = data.totalRx.totalRx;
          this.totalRevenue = data.totalRx.totalRevenue;
          this.totalPatientSaving = data.patientSavingData.totalPatientSaving;
          this.monthNumber = data.monthNumber;
          this.averageTotalRevenue = data.averageTotalRevenue;
          this.averageNetRevenue = data.averageNetRevenue;
          this.handleChart5();
        }
      }

    }, (err) => {
      this.commonService.toggleLoading(false);
    })
  }
  changeChart5(type: any) {
    this.typeChart5 = type;
    this.handleChart5();
  }
  handleChart5() {
    if (this.typeChart5 == 'total') {
      this.initChart5(this.totalRevenueData, 'retail_net_increased_access_dollars');
    } else {
      this.initChart5(this.netRevenueData, 'net_revenue');
    }
  }
}
