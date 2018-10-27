import { Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
declare var Highcharts:any;
declare var $:any;
import {HttpMethod} from "../../shared/services/http.method";
import {Router} from '@angular/router';
import {AnalysisMenuComponent} from "../menu-left/analysis-menu.component";
@Component({
    moduleId: module.id,
    selector: 'MA-performance',
    templateUrl: 'MA-performance.component.html',
    styleUrls: ['./MA-performance.component.css'],
    providers:[AnalysisMenuComponent]
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class MAPerformanceComponent implements OnInit {
    page: number = 1;
    baseUrl:string;
    http_method:any;
    contractedOption:Object;
    options:Object;
    notContractedOption:Object;
    switchedOption:Object;
    listClinic:any;
    datepickerOpts:any;

    dateFrom:any;
    dateTo:any;

    request:{
        location_id:number,
        date_start:any,
        date_end:any,
        time_zone:any,
    }

    listUserResponse:Array<{
        total_patient:number,
        PatientsCapture:number,
        UsingContracted:number,
        AgreeToSwitch:number,
        NotContracted:number,
        last_using_time:any,
        full_name:any,
        day_active:any
    }>;
    
    total_patient:number=0;
    NotContractedTotal:number=0;
    PatientsCaptureTotal:number=0;
    UsingContractedTotal:number=0;
    AgreeToSwitchTotal:number=0;
    contractedPercent:any=0;
    notContractedPercent:any=0;
    agreeToSwitchPercent:any=0;
    currentYear:any;
    timeZone:number;
    rowsOnPage:number;

    menuleft:any;
    
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
        this.listUserResponse = []
        this.listClinic = JSON.parse(localStorage.getItem('listClinicLocation'));
        this.getData();

    }
    ngOnInit() {
        this.datepickerOpts = {
            startDate: new Date(2016, 5, 10),
            autoclose: true,
            todayBtn: 'linked',
            todayHighlight: true,
            assumeNearbyYear: true,
            format: 'd MM yyyy'
        }
    }
    handleDateFromChange($event:any){
        this.dateFrom=$event;
        this.getData();
    }
    handleDateToChange($event:any){
        this.dateTo = $event;
        this.getData();
    }
    changeLocation(){
        this.getData();
    }
    test(){
       
    }
    newData(){
        this.total_patient = 0;
        this.NotContractedTotal=0;
        this.PatientsCaptureTotal=0;
        this.UsingContractedTotal=0;
        this.AgreeToSwitchTotal=0;
    }
    getData(){
        let urlSplit=window.location.href.split('/');
        let page=urlSplit[urlSplit.length-1];
        if(page == 'MA'){
        this.request={
            location_id:this.request.location_id,
            date_start:this.dateFrom.getFullYear()+'-'+(this.dateFrom.getMonth()+1) +'-'+this.dateFrom.getDate(),
            date_end:this.dateTo.getFullYear()+'-'+(this.dateTo.getMonth()+1)+'-'+this.dateTo.getDate(),
            time_zone:this.timeZone,
        }
        
        return this.http_method.postApi(this.baseUrl + 'user/alluserpatient', this.request).subscribe(
            (res: any) => {
                this.menuleft.checkSizePage();
                this.checkAccessdenied(res);
                this.listUserResponse = JSON.parse(res._body).Data;
                this.newData();
                for(let i=0;i<this.listUserResponse.length;i++){
                    // console.log( new Date(this.listUserResponse[i].last_using_time))
                    // this.listUserResponse[i].last_using_time = new Date(this.listUserResponse[i].last_using_time).toLocaleDateString().getHours();
                    this.listUserResponse[i].last_using_time =  new Date(this.listUserResponse[i].last_using_time);
                    this.listUserResponse[i].last_using_time.setHours(this.listUserResponse[i].last_using_time.getHours()+this.timeZone);

                    if(this.listUserResponse[i].last_using_time == 'Invalid Date'){
                        this.listUserResponse[i].last_using_time = "not yet logged in";
                    }
                    else {
                        this.listUserResponse[i].last_using_time = this.listUserResponse[i].last_using_time.toLocaleString('en-us');
                    }
                    this.total_patient += this.listUserResponse[i].total_patient;
                    this.PatientsCaptureTotal +=this.listUserResponse[i].PatientsCapture;
                    this.UsingContractedTotal +=this.listUserResponse[i].UsingContracted;
                    this.AgreeToSwitchTotal +=this.listUserResponse[i].AgreeToSwitch;
                    this.NotContractedTotal +=this.listUserResponse[i].NotContracted;
                }
                this.rowsOnPage = this.listUserResponse.length;
                this.chartContracted();
                this.chartNotContracted();
                this.chartSwitched();
                if(true){
                    setTimeout(() => {
                        this.getData();
                    }, 60000);
                }

                this.contractedPercent=((this.UsingContractedTotal/this.PatientsCaptureTotal)* 100).toFixed();
                this.notContractedPercent=((this.NotContractedTotal/this.PatientsCaptureTotal)* 100).toFixed();
                this.agreeToSwitchPercent=((this.AgreeToSwitchTotal/this.NotContractedTotal)* 100).toFixed();
            
            },
            (error:any) => {
                this.getData();
            });
        }

    }
    chartContracted() {
        let UsingContractedTotalShow = this.UsingContractedTotal;
        if(this.PatientsCaptureTotal==0){
            UsingContractedTotalShow = 1;
        }
         Highcharts.chart('chartContracted', {
             chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                width: 150,
                height: 150,
                backgroundColor:'transparent'

                //plotShadow: false
            },
            pie: {
                size: 10
            },
            title: {
                text: '<b>Septiembre</b><br>2014',
                style: {"fontSize":"90%"},
                verticalAlign: 'middle',
                x: -60,
                y: 0
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
            },
            plotOptions: {
                pie: {
                    size:50,
                    center: ['40%', '18%'],
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            legend: {
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                title: { text: ''},
                itemStyle: {
                    fontWeight: 'normal',
                    fontSize: '0px'
                },
                symbolWidth: 0,
                symbolRadius: 0
            },
            series: [{
                type: 'pie',
                name: 'Title',
                innerSize: '70%',
                data: [
                    { name: 'Contracted', y: UsingContractedTotalShow},
                    { name: 'Patients Captured', y: (this.PatientsCaptureTotal-this.UsingContractedTotal)}
                ]
            }]
         });

    }
    chartNotContracted(){
        let NotContractedTotalShow =  this.NotContractedTotal;
        if(this.PatientsCaptureTotal == 0){
            NotContractedTotalShow = 1;
        }
        Highcharts.chart('chartNotContracted', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                width: 150,
                height: 150,
                backgroundColor:'transparent'

                //plotShadow: false
            },
            pie: {
                size: 10
            },
            title: {
                text: '<b>Septiembre</b><br>2014',
                style: {"fontSize":"90%"},
                verticalAlign: 'middle',
                x: -60,
                y: 0
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
            },
            plotOptions: {
                pie: {
                    size:50,
                    center: ['40%', '18%'],
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            legend: {
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                title: { text: ''},
                itemStyle: {
                    fontWeight: 'normal',
                    fontSize: '0px'
                },
                symbolWidth: 0,
                symbolRadius: 0
            },
            series: [{
                type: 'pie',
                name: 'Title',
                innerSize: '70%',
                data: [
                    { name: 'Not Contracted', y: NotContractedTotalShow},
                    { name: 'Patients Captured', y: (this.PatientsCaptureTotal-this.NotContractedTotal)}
                ]
            }]
        });
    }
    chartSwitched(){
        let AgreeToSwitchTotalShow =  this.AgreeToSwitchTotal;
        if(this.PatientsCaptureTotal == 0){
            AgreeToSwitchTotalShow = 1;
        }
        Highcharts.chart('chartSwitched', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                width: 150,
                height: 150,
                backgroundColor:'transparent'
                //plotShadow: false
            },
            pie: {
                size: 10
            },
            title: {
                text: '<b>Septiembre</b><br>2014',
                style: {"fontSize":"90%"},
                verticalAlign: 'middle',
                x: -60,
                y: 0
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
            },
            plotOptions: {
                pie: {
                    size:50,
                    center: ['40%', '18%'],
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            legend: {
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                title: { text: ''},
                itemStyle: {
                    fontWeight: 'normal',
                    fontSize: '0px'
                },
                symbolWidth: 0,
                symbolRadius: 0
            },
            series: [{
                type: 'pie',
                name: 'Title',
                innerSize: '70%',
                data: [
                    { name: 'Agree To Switch', y: AgreeToSwitchTotalShow},
                    { name: 'Not Contracted', y: (this.NotContractedTotal-this.AgreeToSwitchTotal)}
                ]
            }]
        });
    }
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
        let data:any = [];
        for(let i=0;i<this.listUserResponse.length;i++){
            data.push([this.listUserResponse[i].full_name,this.listUserResponse[i].PatientsCapture,this.listUserResponse[i].UsingContracted,this.listUserResponse[i].NotContracted,this.listUserResponse[i].AgreeToSwitch,this.listUserResponse[i].day_active])
        }
        // console.log(data);
        var csv ='Date: ' + date_start+' to '+date_end + '\nLocation: ' + locationName+'\n \n \nUSERS,PATIENTS CAPTURED,USING CONTRACTED,NOT CONTRACTED,AGREED TO SWITCH,DAY ACTIVE\n';
        data.forEach(function(row:any) {
            csv += row.join(',');
            csv += "\n";
        });
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = date_start+'_'+date_end+'_'+'Medical_Assistant_Performance.csv';
        hiddenElement.click();
    }
    checkAccessdenied(res:any){
        if(JSON.parse(res._body).Status=="access is denied"){
            localStorage.clear();
            this.router.navigate(['/', 'login']);
        }
    }
    requestErr(){
        localStorage.clear();
        this.router.navigate(['/', 'login']);
    }
    selectPage(){
        this.menuleft.checkSizePage();
    }
}
