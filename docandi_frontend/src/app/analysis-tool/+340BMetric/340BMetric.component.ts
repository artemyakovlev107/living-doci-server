import { Component, OnInit } from '@angular/core'
declare var $:any;
import {HttpMethod} from "../../shared/services/http.method";
import {Router} from '@angular/router';
import {AnalysisMenuComponent} from "../menu-left/analysis-menu.component";
declare var numeral:any;
declare var Highcharts:any;

@Component({
    moduleId: module.id,
    selector: 'Three40BMetric',
    templateUrl: '340BMetric.component.html',
    providers:[AnalysisMenuComponent]
})
export class Three40BMetricComponent implements OnInit {
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
    Total_patient:number;
    label1: any[];
    //---
    public doughnutChartLabels1: any[];
    public doughnutChartData1:any[]=[];

    
    public doughnutChartLabels2:any[]
    public doughnutChartData2:any[]= [];
    public doughnutChartLabels3:any[] 
    public doughnutChartData3:any[]= [];

    allpercent:number;

    public doughnutChartType:string = 'doughnut';
	public chartColors: any[] = [
		{ 
		  backgroundColor:["#f4516c", "#34bfa3", "#36a3f7"] 
        }];
    public chartColors3: any[] = [
        { 
            backgroundColor:["#34bfa3", "#36a3f7"] 
        }];

    //-------
    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true,
        scales:{
            yAxes:[{
                ticks:{
                    callback: function(value){
                        return '$' + value;
                    }
                }
            }]
        }
    };
    public barChartLabels: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep','Oct','Nov','Dec'];
    public barChartType: string = 'bar';
    public barChartLegend: boolean = true;
    public barChartData: any[] = [
        {data: [], label: ''}
    ];
    public barchartColors: any[] = [
    { 
        backgroundColor:["#36a3f7", "#36a3f7","#36a3f7","#36a3f7","#36a3f7","#36a3f7","#36a3f7","#36a3f7","#36a3f7","#36a3f7","#36a3f7","#36a3f7"] 
    }];
    //---------
    constructor(private router:Router,http_method: HttpMethod,menuleft:AnalysisMenuComponent) {
        this.menuleft = menuleft;
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
        this.Total_patient = 0;
        this.getData();
        this.getChartData();
    }

    ngOnInit() {
        this.getData();
        this.getChartData();
  
    }
    handleDateFromChange($event:any){
        this.dateFrom=$event;
        this.getData();
        this.getChartData();
    }
    handleDateToChange($event:any){
        this.dateTo = $event;
        this.getData();
        this.getChartData();
       

    }

    getChartData(){

        this.listUserResponse = JSON.parse(localStorage.getItem('listUser_Response'));

        this.allpercent =  + this.listUserResponse.AgreeToSwitch + this.listUserResponse.NotAgreeToSwitch;
        this.doughnutChartLabels1 = ['Switched to a contract pharmacy ('+ ((this.listUserResponse.AgreeToSwitch/this.allpercent)* 100).toFixed() +'%)', 'Did not switch ('+ ((this.listUserResponse.NotAgreeToSwitch/this.allpercent)* 100).toFixed() +'%)'];
 
        this.allpercent = this.listUserResponse.Reason[0].patientNumber + this.listUserResponse.Reason[1].patientNumber + this.listUserResponse.Reason[2].patientNumber;
        this.doughnutChartLabels2 = ['Pharmacies are too far away (' + ((this.listUserResponse.Reason[0].patientNumber/this.allpercent)* 100).toFixed()  +'%)' , 'I am happy with current pharmacy (' + ((this.listUserResponse.Reason[1].patientNumber/this.allpercent)* 100).toFixed()  +'%)', 'Other reason (' + ((this.listUserResponse.Reason[2].patientNumber/this.allpercent)* 100).toFixed()  +'%)'];

        this.allpercent = this.listUserResponse.PatientCaptured;
        this.doughnutChartLabels3 = ['Picked recommended pharmacy (' + ((this.listUserResponse.PickedPreferred/this.allpercent)* 100).toFixed() +'%)', 'Didnot pick recommmended pharmacy (' + (((this.listUserResponse.PatientCaptured - this.listUserResponse.PickedPreferred)/this.allpercent)* 100).toFixed()  +'%)'];
    }
    getData(){
        this.totalPatient = 0;
        
        this.patientArr = [0,0,0,0,0,0,0,0,0,0,0,0];
        this.request={
            location_id:this.request.location_id,
            date_start:this.dateFrom.getFullYear()+'-'+(this.dateFrom.getMonth()+1) +'-'+this.dateFrom.getDate(),
            date_end:this.dateTo.getFullYear()+'-'+(this.dateTo.getMonth()+1)+'-'+this.dateTo.getDate(),
            time_zone:this.timeZone,
        }
        return this.http_method.postApi(this.baseUrl + 'patientcapture/patientscapturesumary', this.request).subscribe(
            (res: any) => {
                this.menuleft.checkSizePage();
                this.checkAccessdenied(res);
                this.listUserResponse = JSON.parse(res._body).Data;

                localStorage.setItem('listUser_Response', JSON.stringify(this.listUserResponse));
                this.TopCurrentPharmacy = this.listUserResponse.TopCurrentPharmacy;
                this.TopSwitchLocation = this.listUserResponse.TopSwitchLocation;
                if (this.listUserResponse.MonthSaving.length != 0){
                    for (var i = 0; i <this.listUserResponse.MonthSaving.length; i++) {
                        this.patientArr[this.listUserResponse.MonthSaving[i].month - 1]=this.listUserResponse.MonthSaving[i].total_patient*62;
                        this.totalPatient += this.listUserResponse.MonthSaving[i].total_patient*62;
                    }
                }

                this.Total_patient = numeral(this.totalPatient).format('0,0');


                this.allpercent =  + this.listUserResponse.AgreeToSwitch + this.listUserResponse.NotAgreeToSwitch;
                this.doughnutChartData1 = [((this.listUserResponse.AgreeToSwitch/this.allpercent)* 100).toFixed(),((this.listUserResponse.NotAgreeToSwitch/this.allpercent)* 100).toFixed()];
               
                this.allpercent = this.listUserResponse.Reason[0].patientNumber + this.listUserResponse.Reason[1].patientNumber + this.listUserResponse.Reason[2].patientNumber;
                this.doughnutChartData2 = [((this.listUserResponse.Reason[0].patientNumber/this.allpercent)* 100).toFixed(),((this.listUserResponse.Reason[1].patientNumber/this.allpercent)* 100).toFixed() , ((this.listUserResponse.Reason[2].patientNumber/this.allpercent)* 100).toFixed()];


                this.allpercent = this.listUserResponse.PickedPreferred + this.listUserResponse.PatientCaptured;
                this.doughnutChartData3 = [((this.listUserResponse.PickedPreferred/this.allpercent)* 100).toFixed(), (((this.listUserResponse.PatientCaptured - this.listUserResponse.PickedPreferred)/this.allpercent)* 100).toFixed()];
                
                this.barChartData  = [
                    {data:  this.patientArr, label: 'Medication savings ($)'}
                ];

            },
            (error:any) => {
                this.getData();
            });
          
    }
    changeLocation(){
        this.getData();
        this.getChartData();
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

    //events
    public chartClicked(e:any):void {
        console.log(e);
    }
    
    public chartHovered(e:any):void {
        console.log(e);
    }
   
    download_csv() {
        let date_start:any=(this.dateFrom.getMonth()+1)+'-' +this.dateFrom.getDate()+'-'+this.dateFrom.getFullYear();
        let date_end:any=(this.dateTo.getMonth()+1)+'-'+this.dateTo.getDate()+'-'+this.dateTo.getFullYear();
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
        data.push([this.patientArr,this.totalPatient])
        var csv ='Date: ' + date_start+' to '+date_end + '\nLocation: ' + locationName;
        csv += '\n\nNumber of patients devided by different types of answers: ';
        csv += '\n \nCurrently Using Contracted Pharmacies,'+this.listUserResponse.Contracted;
        csv += '\nAgree to Switch,'+this.listUserResponse.AgreeToSwitch;
        csv += '\nNot agree to Switch,'+this.listUserResponse.NotAgreeToSwitch;
        csv+='\n\nMedication Savings - '+this.currentYear;
        csv+=' \n January,Febuary,March,April,May,Jun,July,August,September,October,November,December,Total\n';
        data.forEach(function(row:any) {
            csv += row.join(',');
            csv += "\n";
        });
        csv += '\nReasons:';
        csv += '\nPharmacies are not too far away:,'+((this.listUserResponse.Reason[1].patientNumber/this.listUserResponse.NotAgreeToSwitch)*100).toFixed(2) +'%';
        csv += '\nI am happy with my current pharmacies:,'+((this.listUserResponse.Reason[2].patientNumber/this.listUserResponse.NotAgreeToSwitch)*100).toFixed(2) +'%';
        csv += '\nOthers:,'+((this.listUserResponse.Reason[0].patientNumber/this.listUserResponse.NotAgreeToSwitch)*100).toFixed(2) +'%';
        data = [];
        csv += '\n \n';
        csv += 'Top Current Pharmacies,Address,Patient\n';
        for(let i=0;i<this.listUserResponse.TopCurrentPharmacy.length;i++){
            data.push([this.listUserResponse.TopCurrentPharmacy[i].name,this.listUserResponse.TopCurrentPharmacy[i].address,this.listUserResponse.TopCurrentPharmacy[i].numberOfPatient])
        }
        data.forEach(function(row:any) {
            csv += row.join(',');
            csv += "\n";
        });
        data = [];
        csv += '\n \n';
        csv += 'Top Switched Locations,Address,Patient\n';
        for(let i=0;i<this.listUserResponse.TopSwitchLocation.length;i++){
            data.push([this.listUserResponse.TopSwitchLocation[i].name,this.listUserResponse.TopSwitchLocation[i].address,this.listUserResponse.TopSwitchLocation[i].numberOfPatient])
        }
        data.forEach(function(row:any) {
            csv += row.join(',');
            csv += "\n";
        });


        csv += '\nThe percentage of patients who picked recommended pharmacies:,'+(this.listUserResponse.PickedPreferred/this.listUserResponse.PatientCaptured)*100 + '%';
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = date_start+'_'+date_end+'_'+'340B_Metrics.csv';
        hiddenElement.click();
    }
   
}
