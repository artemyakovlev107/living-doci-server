import { Component, OnInit } from '@angular/core';
import {HttpMethod} from "../../shared/services/http.method";
import {Router} from '@angular/router';
import {AnalysisMenuComponent} from "../menu-left/analysis-menu.component";
declare var Highcharts:any;
declare var $:any;
declare var numeral:any;
@Component({
	moduleId: module.id,
	selector: 'Software-Usage',
	templateUrl: 'Software-Usage.component.html',
	styleUrls: ['Software-Usage.component.css'],
    providers:[AnalysisMenuComponent]
})
export class SoftwareUsageComponent implements OnInit {
	dateFrom:any;
	request:{
        location_id:number,
        date_start:any,
        date_end:any,
        time_zone:any,
    }
    dateTo:any;
    baseUrl:string;
    http_method:any;
    timeZone:number;
    total_patient:number=0;
    NotContractedTotal:number=0;
    PatientsCaptureTotal:number=0;
    UsingContractedTotal:number=0;
    AgreeToSwitchTotal:number=0;
    contractedPercent:any=0;
    notContractedPercent:any=0;
    agreeToSwitchPercent:any=0;
    contractedOption:Object;
    notContractedOption:Object;
    switchedOption:Object;
    currentMenu:string;
    listClinic:any;
    currentYear:any;
    highOption:Object;
    listDataResponse: any;
    listDataMapViewed: any;
    mapClick: any;
    hoursClick: any;
    self_pay:any;
    driveClick: any;
    deliveryClick: any;
    syncClick: any;
    AverageTimePerPatient: any;
    AverageTimePerPatientNotSwitch: any;
    Option:Object;
    optionsMedicationSavings:Object;
    totalPatient:number = 0;
    patientArr:Array<number>;
    optionRecommended:Object;
    recommendedPercent :any;
    usersOnline: any;
    AverageTimePerPatientFormat: any;
    AverageTimePerPatientNotSwitchFormat:any;
    menuleft:any;
    patientFreedomArr:Array<number>;
	constructor(private router:Router,http_method: HttpMethod,menuleft:AnalysisMenuComponent) {
        this.menuleft = menuleft;
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
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
        this.listDataResponse = []
        this.listDataMapViewed = []
        this.listClinic = JSON.parse(localStorage.getItem('listClinicLocation'));
        this.getData();
        router.events.subscribe((val:any) => {
            this.currentMenu = val.urlAfterRedirects;
        });
    }

	ngOnInit() {
		// $('.a').val();
	}

	getData(){
        this.totalPatient = 0;
        this.patientFreedomArr = [0,0,0,0,0,0,0,0,0,0,0,0];
        this.patientArr = [0,0,0,0,0,0,0,0,0,0,0,0];
        this.request={
            location_id:this.request.location_id,
            date_start:this.dateFrom.getFullYear()+'-'+(this.dateFrom.getMonth()+1) +'-'+this.dateFrom.getDate(),
            date_end:this.dateTo.getFullYear()+'-'+(this.dateTo.getMonth()+1)+'-'+this.dateTo.getDate(),
            time_zone:this.timeZone,
        }
        return this.http_method.postApi(this.baseUrl + 'patientcapture/softwareusage', this.request).subscribe(
            (res: any) => {
                    this.menuleft.checkSizePage();
                    this.checkAccessdenied(res);
                    this.listDataResponse = JSON.parse(res._body).Data;
                    this.listDataMapViewed = JSON.parse(res._body).Data.MapViewed;
                    this.mapClick = this.listDataResponse.UsedMap;
                    this.hoursClick = this.listDataMapViewed[1][0].viewedTimes;
                    this.driveClick = this.listDataMapViewed[2][0].viewedTimes;
                    this.deliveryClick = this.listDataMapViewed[3][0].viewedTimes;
                    this.syncClick = this.listDataMapViewed[4][0].viewedTimes;
                    this.self_pay = this.listDataMapViewed[5][0].viewedTimes;
                    this.AverageTimePerPatient = this.listDataResponse.AverageTimePerPatient[0].AverageTimePerPatient;
                    this.AverageTimePerPatientNotSwitch = this.listDataResponse.AverageTimePerPatientNotSwitch[0].AverageTimePerPatientNotSwitch;
                    this.AverageTimePerPatientFormat = this.setAverageTime(this.AverageTimePerPatient);
                    this.AverageTimePerPatientNotSwitchFormat = this.setAverageTime(this.AverageTimePerPatientNotSwitch);
                    // console.log(this.AverageTimePerPatientFormat);
                    for (var i = 0; i < this.listDataResponse.TotalFreedomChoicePickedSumary.length; i++) {
                        this.patientFreedomArr[this.listDataResponse.TotalFreedomChoicePickedSumary[i].month - 1]=this.listDataResponse.TotalFreedomChoicePickedSumary[i].total_patient;
                        this.totalPatient += this.listDataResponse.TotalFreedomChoicePickedSumary[i].total_patient;
                    }
                    for (var i = 0; i < this.listDataResponse.TotalMonthlyPatient.length; i++) {
                        this.patientArr[this.listDataResponse.TotalMonthlyPatient[i].month - 1]=this.listDataResponse.TotalMonthlyPatient[i].total_patient;
                       
                    }


                    // this.chartMedicationSavings();

                    this.usersOnline = this.listDataResponse.UsersOnline;
                    this.Highcharts();
                    // this.chartRecommended();

                    this.newData();

                    // this.chartContracted();
                    // this.chartNotContracted();
                    // this.chartSwitched();
                    this.contractedPercent=((this.UsingContractedTotal/this.PatientsCaptureTotal)* 100).toFixed();
                    this.notContractedPercent=((this.NotContractedTotal/this.PatientsCaptureTotal)* 100).toFixed();
                    this.agreeToSwitchPercent=((this.AgreeToSwitchTotal/this.NotContractedTotal)* 100).toFixed();
            },
            (error:any) => {
                this.getData();
            });
    }

    setAverageTime(num: any) {
        let h: any = Math.floor(num / 3600);
            let m: any = Math.floor((num - (h * 3600))/60);
            let s: any = num - (h * 3600) - (m * 60);
            if(h==0) {
                if(m==0) {
                    if (s < 60) {s = s.toFixed(2);}
                    return s+' seconds';
                }
                if (m < 10) {m = m;}
                if (s < 10) {s = s.toFixed(2);}
                return m+' minutes : '+s+' seconds';
            }
            if(m==0) {
                if (h   < 10) {h   = "0"+h;}
                if (s < 10) {s = s.toFixed(2);}
                return h+' hours : '+s+' seconds';
            }

            if (h   < 10) {h   = h;}
            if (m < 10) {m = m;}
            if (s < 10) {s = s.toFixed();}

            return h+' hours : '+m+' minutes : '+s+' seconds';


    }

    changeLocation(){
        this.getData();
    }

	handleDateFromChange($event:any){
        this.dateFrom=$event;
        this.getData();
    }

    checkAccessdenied(res:any){
        if(JSON.parse(res._body).Status=="access is denied"){
            localStorage.clear();
            this.router.navigate(['/', 'login']);
        }
    }

    newData(){
        this.total_patient = 0;
        this.NotContractedTotal=0;
        this.PatientsCaptureTotal=0;
        this.UsingContractedTotal=0;
        this.AgreeToSwitchTotal=0;
    }

    // chartContracted() {
    //     let UsingContractedTotalShow = this.UsingContractedTotal;
    //     if(this.PatientsCaptureTotal==0){
    //         UsingContractedTotalShow = 1;
    //     }
    //     this.contractedOption = {
    //         chart: {
    //             plotBackgroundColor: null,
    //             plotBorderWidth: 0,
    //             width: 150,
    //             height: 150,
    //             backgroundColor:'transparent'

    //             //plotShadow: false
    //         },
    //         pie: {
    //             size: 10
    //         },
    //         title: {
    //             text: '<b>Septiembre</b><br>2014',
    //             style: {"fontSize":"90%"},
    //             verticalAlign: 'middle',
    //             x: -60,
    //             y: 0
    //         },
    //         tooltip: {
    //             pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
    //         },
    //         plotOptions: {
    //             pie: {
    //                 size:50,
    //                 center: ['-50%', '18%'],
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
    //             symbolRadius: 6
    //         },
    //         series: [{
    //             type: 'pie',
    //             name: 'Quantity',
    //             innerSize: '70%',
    //             data: [
    //                 { name: 'Contracted', y: UsingContractedTotalShow},
    //                 { name: 'Patients Captured', y: (this.PatientsCaptureTotal-this.UsingContractedTotal)}
    //             ]
    //         }]
    //     }
    // }

    // chartNotContracted(){
    //     let NotContractedTotalShow =  this.NotContractedTotal;
    //     if(this.PatientsCaptureTotal == 0){
    //         NotContractedTotalShow = 1;
    //     }
    //     this.notContractedOption = {
    //         chart: {
    //             plotBackgroundColor: null,
    //             plotBorderWidth: 0,
    //             width: 150,
    //             height: 150,
    //             backgroundColor:'transparent'

    //             //plotShadow: false
    //         },
    //         pie: {
    //             size: 10
    //         },
    //         title: {
    //             text: '<b>Septiembre</b><br>2014',
    //             style: {"fontSize":"90%"},
    //             verticalAlign: 'middle',
    //             x: -60,
    //             y: 0
    //         },
    //         tooltip: {
    //             pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
    //         },
    //         plotOptions: {
    //             pie: {
    //                 size:50,
    //                 center: ['-50%', '18%'],
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
    //             title: { text: ''},
    //             itemStyle: {
    //                 fontWeight: 'normal',
    //                 fontSize: '11px'
    //             },
    //             symbolWidth: 12,
    //             symbolRadius: 6
    //         },
    //         series: [{
    //             type: 'pie',
    //             name: 'Quantity',
    //             innerSize: '70%',
    //             data: [
    //                 { name: 'Not Contracted', y: NotContractedTotalShow},
    //                 { name: 'Patients Captured', y: (this.PatientsCaptureTotal-this.NotContractedTotal)}
    //             ]
    //         }]
    //     }
    // }

    handleDateToChange($event:any){
        this.dateTo = $event;
        this.getData();
    }

    Highcharts() {
        let muserOnline: any = [];
        // console.log(this.usersOnline)
        this.usersOnline.slice(8, 17).forEach(function(entry: any) {
            let newEntry = parseFloat(entry);
            let test = newEntry.toFixed(2);
            muserOnline.push(parseFloat(test));
        });

        let width:any = this.menuleft.getWidthChartParentSUTime();
        Highcharts.chart('highOption', {
            chart: {
                type: 'areaspline',
                width: width,
                height: 300,
                backgroundColor:'transparent'
            },
            title: {
                text: ''
            },
            // legend: {
            //     layout: 'vertical',
            //     align: 'left',
            //     verticalAlign: 'top',
            //     x: 150,
            //     y: 100,
            //     floating: true,
            //     borderWidth: 1
            // },
            xAxis: {
                categories: [
                    '8-9am',
                    '9-10am',
                    '10-11am',
                    '11-12am',
                    '12-1pm',
                    '1-2pm',
                    '2-3pm',
                    '3-4pm',
                    '4-5pm'
                ],
                plotBands: [{ // visualize the weekend
                    from: 4.5,
                    to: 6.5,
                    color: ''
                }],
                title: {
                    text: 'time of day',
                    style: {
                        "color": "#5D5D5D",
                        "fontSize": "14px",
                        "fontFamily": "Open Sans",
                        "fontWeight": "600"
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'users online',
                    style: {
                        
                        "color": "#5D5D5D",
                        "fontSize": "14px",
                        "fontFamily": "Open Sans",
                        "fontWeight": "600"
                    }
                }
            },
            tooltip: {
                shared: true,
                valueSuffix: ' users'
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                areaspline: {
                    fillOpacity: 0.5
                }
            },
            series: [{
                name: 'Users Online',
                data: muserOnline
            }]
        });
    }

    // chartSwitched(){
    //     Highcharts.chart('option', {
    //         chart: {
    //             plotBackgroundColor: null,
    //             plotBorderWidth: 0,
    //             width: 240,
    //             height: 300,
    //             backgroundColor:'transparent'
    //             //plotShadow: false
    //         },
    //         pie: {
    //             size: 30
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
    //                 size:160,
    //                 center: ['50%', '52%'],
    //                 dataLabels: {
    //                     enabled: false
    //                 },
    //                 showInLegend: true
    //             }
    //         },
    //         legend: {
    //             align: 'right',
    //             verticalAlign: 'bottom',
    //             layout: 'vertical',
    //             //            style: {"fontSize":"20%"},
    //             title: { text: 'FRUITS'},
    //             itemStyle: {
    //                 fontWeight: 'normal',
    //                 fontSize: '15px'
    //             },
    //             symbolWidth: 12,
    //             symbolRadius: 6
    //         },
    //         series: [{
    //             type: 'pie',
    //             name: 'Quantity',
    //             innerSize: '70%',
    //             data: [
    //             { name: 'Used The Map', y: this.mapClick},
    //             { name: 'Not Used Map', y: this.listDataResponse.TotalPatient - this.mapClick}
    //             ]
    //         }]
    //     });
    // }

    // chartMedicationSavings(){
    //     let width:any = this.menuleft.getWidthChartParentSU();
    //      Highcharts.chart('chartMedicationSavings', {
    //          chart: {
    //     type: 'column',
    //     width: width,
    //     height: 350,
    //     backgroundColor:'transparent'
    // },
    // title: {
    //     text: 'Times checkbox selected for freedom of choice'
    // },

    // subtitle: {
    //     text: 'Total:'+ numeral(this.totalPatient).format('0,0')
    // },
    // colors: [
    //     '#ff0000',
    //     '#36a3f7',
    //     '#34bfa3'
    // ],
    // xAxis: {
    //     categories: [
    //         'Jan',
    //         'Feb',
    //         'Mar',
    //         'Apr',
    //         'May',
    //         'Jun',
    //         'Jul',
    //         'Aug',
    //         'Sep',
    //         'Oct',
    //         'Nov',
    //         'Dec'
    //     ],
    //     crosshair: true
    // },
    // yAxis: {
    //     min: 0,
    //     title: {
    //         text: 'Patients'
    //     }
    // },
    // tooltip: {
    //     headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
    //     pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
    //         '<td style="padding:0"><b>{point.y}</b></td></tr>',
    //     footerFormat: '</table>',
    //     shared: true,
    //     useHTML: true
    // },
    // plotOptions: {
    //     column: {
    //         pointPadding: 0.1,
    //         borderWidth: 0
    //     }
    // },
    // series: [{
    //     name: 'times freedom of choice selected',
    //     data: this.patientFreedomArr,
    //     color: '#90ed7d',

    // }, {
    //     name: 'number of patients captured',
    //     data: this.patientArr,
    //     color:'#7cb5ec',

    // }]
    //      });
    // }

    // chartRecommended() {
    //     Highcharts.chart('chartRecommended', {
    //         chart: {
    //             plotBackgroundColor: null,
    //             plotBorderWidth: 0,
    //             width: 150,
    //             height: 150,
    //             backgroundColor:'transparent'

    //             //plotShadow: false
    //         },
    //         pie: {
    //             size: 10
    //         },
    //         title: {
    //             text: '',
    //             style: {"fontSize":"90%"},
    //             verticalAlign: 'middle',
    //             x: -60,
    //             y: 0
    //         },
    //         tooltip: {
    //             pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
    //         },
    //         plotOptions: {
    //             pie: {
    //                 size:50,
    //                 center: ['-50%', '18%'],
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
    //             symbolRadius: 6
    //         },
    //         series: [{
    //             type: 'pie',
    //             name: 'Percent',
    //             innerSize: '70%',
    //             data: [
    //             { name: 'Token Redeemed', y: this.listDataResponse.TokenRedeemed},
    //             { name: 'Total Not Redeemed', y: this.listDataResponse.totalToken - this.listDataResponse.TokenRedeemed}
    //             ]
    //         }]
    //     });
    // }

    download_csv() {
        let date_start=(this.dateFrom.getMonth()+1)+'-' +this.dateFrom.getDate()+'-'+this.dateFrom.getFullYear();
        let date_end=(this.dateTo.getMonth()+1)+'-'+this.dateTo.getDate()+'-'+this.dateTo.getFullYear();
        let locationName:string='All Locations';
            if(this.request.location_id ==0){
                locationName='All Locations';
            }
                else {
                for(let i=0;i<this.listClinic.length;i++){
                    if(this.request.location_id == this.listClinic[i].id){
                        locationName = this.listClinic[i].name;
                        break;
                    }
                }
            }

        let muserOnline: any = [];
        muserOnline.push('8-9am, ' + this.usersOnline[9]);
        muserOnline.push('9-10am, ' + this.usersOnline[10]);
        muserOnline.push('10-11am, ' + this.usersOnline[11]);
        muserOnline.push('11-12am, ' + this.usersOnline[12]);
        muserOnline.push('12-1pm, ' + this.usersOnline[13]);
        muserOnline.push('1-2pm, ' + this.usersOnline[14]);
        muserOnline.push('2-3pm, ' + this.usersOnline[15]);
        muserOnline.push('3-4pm, ' + this.usersOnline[16]);
        muserOnline.push('4-5pm, ' + this.usersOnline[17]);
      
        var csv ='Date: ' + date_start+' to '+date_end + '\nLocation: ' + locationName+'\n\nTime of Use\n\n' + 'Time of day, ' + 'Users Online \n';
        muserOnline.forEach(function(row:any) {
            csv += row;
            csv += "\n";
        });

        csv += '\n \nPharmacy Map\n';
        csv += '\nDid not use map:,'+this.listDataResponse.TotalPatient;
        csv += '\nUsed map:,'+this.listDataResponse.UsedMap;
        csv+='\n' + ',Map,' + 'All results,' + 'Drive Thru,' + 'Delivery,' + '24h,' + 'Sync,Self Pay\n';

        let pharmacyData:any = [];
        pharmacyData.push(['Number of View& Clicks',this.mapClick,this.mapClick,this.driveClick,this.deliveryClick,this.hoursClick,this.syncClick,this.self_pay]);
        pharmacyData.forEach(function(row:any) {
            csv += row.join(',');
        });

        csv += '\n\n340 Script - Patient Capture\n\n' + 'Month,' + 'January,' + 'Febuary,' + 'March,' + 'April,' + 'May,' + 'June,' + 'July,' + 'August,' + 'September,' + 'October,' + 'November,' + 'December\n' + 'Times checkbox selected for freedom of choice,';
        let patientData:any = [];
        patientData.push([this.patientFreedomArr[0],this.patientFreedomArr[1],this.patientFreedomArr[2],this.patientFreedomArr[3],this.patientFreedomArr[4],this.patientFreedomArr[5],this.patientFreedomArr[6],this.patientFreedomArr[7],this.patientFreedomArr[8],this.patientFreedomArr[9],this.patientFreedomArr[10],this.patientFreedomArr[11]]);
        patientData.forEach(function(row:any) {
            csv += row.join(',');
        });
        csv+='\n Number of patients captured,';
        patientData = [];
        patientData.push([this.patientArr[0],this.patientArr[1],this.patientArr[2],this.patientArr[3],this.patientArr[4],this.patientArr[5],this.patientArr[6],this.patientArr[7],this.patientArr[8],this.patientArr[9],this.patientArr[10],this.patientArr[11]]);
        patientData.forEach(function(row:any) {
            csv += row.join(',');
        });
        csv += '\n \nAverage time on app per patient (seconds) :,' + this.AverageTimePerPatient + "\nAverage time on app per patient who didn't switch (seconds):," + this.AverageTimePerPatientNotSwitch;        csv += '\n\nDashboard\n';
        csv += '\nChanged Avatar:,'+this.listDataResponse.TimesChangedAvatar;
        csv += '\nChanged Background:,'+this.listDataResponse.TimesChangeBackground;
        csv += '\nTokens Redeemed:,'+this.listDataResponse.TokenRedeemed;

        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = date_start+'_'+date_end+'_'+'Software-Usage.csv';
        hiddenElement.click();
    }
}