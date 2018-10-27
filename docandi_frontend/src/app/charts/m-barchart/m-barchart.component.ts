import { Component, OnInit } from '@angular/core';

declare var $:any;
import {HttpMethod} from "../../shared/services/http.method";
import {Router} from '@angular/router';
declare var numeral:any;
declare var Highcharts:any;

@Component({
  selector: 'app-m-barchart',
  templateUrl: './m-barchart.component.html',
  styleUrls: ['./m-barchart.component.scss'],
  providers:[MBarchartComponent]
})

export class MBarchartComponent implements OnInit {
  baseUrl:string;
  http_method:any;
  listClinic:any;
  currentYear:any;
  timeZone:number;
  dateFrom:any;
  dateTo:any;
  listUserResponse:any;
  request:{
      location_id:number,
      date_start:any,
      date_end:any,
      time_zone:number,
  }
  Option:Object;
  optionsMedicationSavings:Object;
  optionRecommended:Object;
  totalPatient:number = 0;
  patientArr:Array<number>;
  optionsReason:Object;
  TopCurrentPharmacy:Array<{name:string,address:string}>;
  TopSwitchLocation:Array<{name:string,address:string}>;
  recommendedPercent :any;
  menuleft:any;
  constructor(private router:Router,http_method: HttpMethod) {

      this.http_method = http_method;
      this.baseUrl = this.http_method.baseUrl;
      this.listClinic = JSON.parse(localStorage.getItem('listClinicLocation'));
      this.currentYear = new Date().getFullYear();
      this.dateFrom = new Date(this.currentYear,0,1);
      this.dateTo = new Date();
      this.timeZone = new Date().getTimezoneOffset()/-60;
      this.request={
          location_id:0,
          date_start:this.dateFrom,
          date_end:this.dateTo,
          time_zone:this.timeZone,
      }
      this.patientArr = [0,0,0,0,0,0,0,0,0,0,0,0];

    //   this.getData();

  }
  ngOnInit() {

  }

//   getData(){
//       this.totalPatient = 0;
//       this.patientArr = [0,0,0,0,0,0,0,0,0,0,0,0];
//       this.request={
//           location_id:this.request.location_id,
//           date_start:this.dateFrom.getFullYear()+'-'+(this.dateFrom.getMonth()+1) +'-'+this.dateFrom.getDate(),
//           date_end:this.dateTo.getFullYear()+'-'+(this.dateTo.getMonth()+1)+'-'+this.dateTo.getDate(),
//           time_zone:this.timeZone,
//       }
//       return this.http_method.postApi(this.baseUrl + 'patientcapture/patientscapturesumary', this.request).subscribe(
//           (res: any) => {
//               this.menuleft.checkSizePage();
//               this.listUserResponse = JSON.parse(res._body).Data;
//               this.TopCurrentPharmacy = this.listUserResponse.TopCurrentPharmacy;
//               this.TopSwitchLocation = this.listUserResponse.TopSwitchLocation;
//               for (var i = 0; i <this.listUserResponse.MonthSaving.length; i++) {
//                   this.patientArr[this.listUserResponse.MonthSaving[i].month - 1]=this.listUserResponse.MonthSaving[i].total_patient*62;
//                   this.totalPatient += this.listUserResponse.MonthSaving[i].total_patient*62;
//               }
//               // console.log(this.patientArr)

//               // this.chartSwitched();
//           },
//           (error:any) => {
//               this.getData();
//           });
//   }
//   changeLocation(){
//       this.getData();
//   }

  // chartSwitched(){
  //      Highcharts.chart('chartSwitched', {
  //              chart: {
  //             plotBackgroundColor: null,
  //             plotBorderWidth: 0,
  //             width: 294,
  //             height: 334,
  //             backgroundColor:'transparent'
  //             //plotShadow: false
  //         },
  //         pie: {
  //             size: 100
  //         },
  //         title: {
  //             text: '',
  //             style: {"fontSize":"90%"},
  //             //            align: 'center',
  //             verticalAlign: 'middle',
  //             x: -10,
  //             y: 0
  //         },
  //         tooltip: {
  //             pointFormat: '{series.name}: <b>{point.y}</b>',
  //         },
  //         plotOptions: {
  //             pie: {
  //                 size:210,
  //                 center: ['265%', '39%'],
  //                 dataLabels: {
  //                     enabled: false
  //                 },
  //                 showInLegend: true
  //             }
  //         },
  //         legend: {
  //             align: 'right',
  //             verticalAlign: 'top',
  //             layout: 'vertical',
  //             title: { text: 'FRUITS'},
  //             itemStyle: {
  //                 fontWeight: 'normal',
  //                 fontSize: '11px'
  //             },
  //             symbolWidth: 12,
  //             symbolRadius: 6,
  //             enabled:true
  //         },
  //         series: [{
  //             type: 'pie',
  //             name: 'Quantity',
  //             innerSize: '70%',
  //             data: [
  //             { name: 'using contracted pharmacy', y: this.listUserResponse.Contracted},
  //             { name: 'agreed to switch', y: this.listUserResponse.AgreeToSwitch},
  //             { name: 'did not switch', y: this.listUserResponse.NotAgreeToSwitch}
  //             ]
  //         }]
  //      });
  // }

}

