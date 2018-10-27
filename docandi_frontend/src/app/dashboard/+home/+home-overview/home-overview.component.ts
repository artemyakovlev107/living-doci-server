import { CommonDataService } from './../../../shared/services/common-data.service';
declare var numeral: any;
declare var $: any;
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
declare var Highcharts: any;

import { Observable } from "rxjs";

import { HttpMethod } from "../../../shared/services/http.method";
import { UserDataService } from "../../../shared/services/userdata.services";
import { HandleTooltipService } from '../../../shared/services/handleTooltip.service';
@Component({
    moduleId: module.id,
    styleUrls: ['home-overview.component.css'],
    templateUrl: 'home-overview.component.html',
    selector: "home-overview",
    providers: [HttpMethod]
})

export class HomeOverviewComponent {
    showMenu: string = '';
    baseUrl: string;
    errorMessage: string = "";
    userName = localStorage.getItem('name');
    currentUser: {
        totalDayPatient:any,
        total_patient: number,
        token:any,
        total_point: number,
        day_point: number,
        month_point: number,
        survey_day: {
            expected_patients: number
        },
        full_name: string
        listTotalPatientPerMonth:Array<{month:number,total_patient:number}>,
        listTotalMonthPatientSaving:Array<{month:number,total_patient:number}>,
        listSwitched:Array<{month:number,total_patient:number}>,
        listNotContracted:Array<{month:number,total_patient:number}>,

    };
    //----recent-------
    request:{
        date_end:any,
        location_id: number
    }
    date_activity: any;

    recentactivity: Array<{
        status:number,
        user_id:number,
        full_name: string,
        avatarUrl: string,
        id:number
    }>;

    // activity_displayed: Array<{
    //     status:string,
    //     avatarUrl: string,
    //     full_name:string
    // }>;
    activity_displayed: any ;

    alluser: Array<{
        id: number,
        full_name: string,
        avatarUrl: string
    }>;
    //-------------------
    currentClinic:{
        id: number,
        TopUser:Array<any>
     
    };
    pointInDay: number;
    tokenInDay: number;
    options: Object;
    http_method: any;
    // patientArr:Array<number>;
    totalMedicationSavings: number = 0;
    total_MedicationSaving: any;
    totalSwitchedPatients: number = 0;
    postMessage: Array<string>;
    positiveMessages: string;
    quotes: {
        content: any,
        author: any,
        last_used: any
    };
    userDataStore: Observable<Object>;
    currentYear: number;
    pointShowInChart: number;
    currentLocation: {
        image_url: string;
    }
    pageView:any;
    stepView:any;
    currentStep:number=1;
    value1:number;
    //------chart------
    public doughnutChartLabels: any[];
	public doughnutChartData: any[];
	public doughnutChartType: string = 'doughnut';
	public doughnutChartColors: any[] = [
		{ 
		  backgroundColor:["#f4516c", "#34bfa3", "#36a3f7"] 
		}];
    //
    usingcontract:number;
    switched:number;
    notswithced:number;
    allcontract:number;
    //
    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true
    };
    public barChartLabels: string[] = ['Mon', 'Tue', 'Wen', 'Tur','Fri'];
    public barChartType: string = 'bar';
    public barChartLegend: boolean = true;
    public barChartColors: any[] = [
		{ 
		     backgroundColor:["#f4516c","#f4516c","#f4516c","#f4516c","#f4516c"]
        },
        { 
             backgroundColor:["#36a3f7","#36a3f7","#36a3f7","#36a3f7","#36a3f7"]
        }
    ];
    public barChartData: any[] = [
        {data: [15, 49, 30, 12, 56], label: 'Patients captured'},
        {data: [28, 48, 40, 19, 86], label: 'Goal'}
    ];
    //chart2
    patientArr:Array<number>;
    listSwitched:Array<number>;
    listNotContracted:Array<number>;
	// events
	chartClicked (e: any): void {
	}

	chartHovered (e: any): void {
    }
    
    //------------

    ngOnInit() {
        if (localStorage.getItem('currentClinic')) {
            this.currentClinic = JSON.parse(localStorage.getItem('currentClinic'));
      
            for (var i = 0; i < this.currentClinic.TopUser.length; i++) {

                // this.patientArr[this.currentUser.listTotalMonthPatientSaving[i].month - 1]=this.currentUser.listTotalMonthPatientSaving[i].total_patient*62;
                this.currentClinic.TopUser[i].month_point = '$' + numeral(this.currentClinic.TopUser[i].month_point).format('0,0');

            }

        }
        if (localStorage.getItem('currentLocation')) {
            this.currentLocation = JSON.parse(localStorage.getItem('currentLocation'));
        }
        this.quotes = this.commonDataService.getQoutes();
        if (!this.quotes.last_used) {
            this.getQuotes();
        };
        if (localStorage.getItem('currentUser')) {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            for (var i = 0; i <this.currentUser.listTotalPatientPerMonth.length; i++) {
                this.patientArr[this.currentUser.listTotalPatientPerMonth[i].month - 1]=this.currentUser.listTotalPatientPerMonth[i].total_patient;
                // this.totalPatient += this.currentUser.listTotalPatientPerMonth[i].total_patient;
            }
            for (var i = 0; i <this.currentUser.listSwitched.length; i++) {
                this.listSwitched[this.currentUser.listSwitched[i].month - 1]=this.currentUser.listSwitched[i].total_patient;

            }
            for (var i = 0; i <this.currentUser.listNotContracted.length; i++) {
                this.listNotContracted[this.currentUser.listNotContracted[i].month - 1]=this.currentUser.listNotContracted[i].total_patient;
            }
            this.handleUserInfo();

        }   
        
        if(localStorage.getItem('opened_startTour')!='1' && localStorage.getItem('completed_tutorial')!='1'){
            $('#tourModal').data('bs.modal',null);  
            $('#tourModal').modal({
                show: 'true',
                backdrop: 'static',
                keyboard: false
            });
            this._tooltip.hideTour();
        }
        // this.getRecentactivity();
        
       
    }
    constructor(private router: Router, http_method: HttpMethod, private _userdataServices: UserDataService, 
        private commonDataService: CommonDataService,private _tooltip: HandleTooltipService) {
        this.currentLocation = {
            image_url: '',
        }
        this.currentClinic = JSON.parse(localStorage.getItem('currentClinic'));
        
        this.patientArr = [0,0,0,0,0,0,0,0,0,0,0,0];
        this.listSwitched = [0,0,0,0,0,0,0,0,0,0,0,0];
        this.listNotContracted = [0,0,0,0,0,0,0,0,0,0,0,0];

        this.currentYear = new Date().getFullYear();
        // this.patientArr = [0,0,0,0,0,0,0,0,0,0,0,0];
        this.currentUser = {
            listTotalPatientPerMonth:null,

            listSwitched:null,
            listNotContracted:null,
            totalDayPatient:0,
            total_patient:0,
            token:0,
            total_point: 0,
            day_point: 0,
            listTotalMonthPatientSaving: [],
            month_point: 0,
            survey_day: {
                expected_patients: 0
            },
            full_name: null

        };

        this.date_activity = new Date();


        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.getAccountInfo();
        this.getAllUserInfo();
        this.getRecentactivity();
       
        // this.test();
        this.postMessage = [
            'You are on track to hit your goal! ', 'you are halfway to your goal of 100K points', 'You are a rockstar! You hit your goal of 100K points!'
        ];
        this._tooltip.exportTooltip.subscribe(data=>{           
            this.pageView = data.page;
            this.stepView = data.active;
        })
    }

    ngAfterViewInit() {
        this.chartOption2();
    }

    setPositiveMessages() {
        if (this.pointShowInChart < 50000) {
            this.positiveMessages = this.postMessage[0];
        }
        else if (this.pointShowInChart > 50000 && this.pointShowInChart < 51000) {
            this.positiveMessages = this.postMessage[1];
        }
        else if (this.pointShowInChart > 99000 && this.pointShowInChart < 100000) {
            this.positiveMessages = this.postMessage[2];
        }
        else {
            this.positiveMessages = this.postMessage[0];
        }
    }
    goto340b() {
        this.router.navigate(['/', '340b']);
    }
    getAccountInfo() {
        return this.http_method.callApi(this.baseUrl + "users/getuserdetails").subscribe(
            (user: any) => {
                console.log(user);
                this.checkAccessdenied(user);
                this.currentUser = JSON.parse(user._body).Data;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.handleUserInfo();
            },
            (error: any) => this.getAccountInfo());

    }
    //added
    getAllUserInfo() {
        return this.http_method.callApi(this.baseUrl + "user/getalluser").subscribe(
            (user: any) => {
                console.log(user);
                this.checkAccessdenied(user);
                this.alluser = JSON.parse(user._body).Data;
                localStorage.setItem('allusers', JSON.stringify(this.alluser));

            },
            (error: any) => this.getAccountInfo());

    }
    
    getRecentactivity() {
       
        this.request={
            location_id: this.currentClinic.id,
            date_end:this.date_activity.getFullYear()+'-'+(this.date_activity.getMonth()+1)+'-'+this.date_activity.getDate()
            
        }

        console.log(this.request);
        return this.http_method.postApi(this.baseUrl + 'patientcapture/getrecentactivity',  this.request).subscribe(
            (res: any) => {
                console.log(res);
               this.checkAccessdenied(res);
                this.recentactivity = JSON.parse(res._body).Data;
                console.log(this.recentactivity);
                localStorage.setItem('recentactivity', JSON.stringify(this.recentactivity));
                if (this.recentactivity.length !=0 ) {
                            this.alluser = JSON.parse(localStorage.getItem('allusers'));
                            for (var i = 0; i < this.recentactivity.length; i++) {
                             
                                for (var j = 0; j < this.alluser.length; j++) {
                                    if( this.alluser[j].id ==  this.recentactivity[i].user_id){
                                        // switch (this.recentactivity[i].status)
                                        // {
                                        //     case 1: this.activity_displayed.push(['Educated patient already using contract pharmacy about 340b', this.alluser[j].avatarUrl, this.alluser[j].full_name]);  break;
                                        //     case 2: this.activity_displayed.push(['Switched a patient to a contract pharmacy', this.alluser[j].avatarUrl, this.alluser[j].full_name]);  break;
                                        //     case 3: this.activity_displayed.push(['Captured a patient that decided not to use a contract pharmacy', this.alluser[j].avatarUrl, this.alluser[j].full_name]);  break;
                                        //     default: break;
                                        // }
                                        this.recentactivity[i].avatarUrl = this.alluser[j].avatarUrl;
                                        this.recentactivity[i].full_name = this.alluser[j].full_name;
                                        // this.activity_displayed.push([ this.recentactivity[i].status, this.alluser[j].avatarUrl, this.alluser[j].full_name]); 
                                    }
                                }
                            }
                            
                        }
            },
            (error: any) => this.getRecentactivity());
    }

    chartOption2(){
           
        let width:any = $('#chart2_helped').width() - 50;
        Highcharts.chart('patients_helped', {
            title: {
            style: {"fontSize":"15px"},
            text: 'Since Jan 1 '+this.currentYear,
            x: -20 //center
            },
            chart: {
                width: 420,
                height: 240,
            },
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: {
                title: {
                    text: ' '
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: ''
            },
            legend: {
                // layout: 'vertical',
                // align: 'top',
                // verticalAlign: 'top',
                // borderWidth: 0,
                // enabled:true
            },
            series: [{
                name: 'Patients Captured',
                data: this.patientArr,
                color: '#90ed7d',
            },{
                name:'Switched',
                data:this.listSwitched,
                color:'#7cb5ec',
            },
                {
                name:' Not Contracted',
                data:this.listNotContracted,
                    color:'black',
            }],
            plotOptions: {
                pie: {
                    size:'100%',
                }
            }
        });
    }

    handleUserInfo() {
        if (this.currentUser) {
            this.pointInDay = this.currentUser.day_point;
            this.tokenInDay = Math.floor(this.currentUser.day_point / 100000);

            if (this.currentUser.listTotalMonthPatientSaving != null && this.currentUser.listTotalMonthPatientSaving.length > 0) {
                for (var i = 0; i < this.currentUser.listTotalMonthPatientSaving.length; i++) {

                    // this.patientArr[this.currentUser.listTotalMonthPatientSaving[i].month - 1]=this.currentUser.listTotalMonthPatientSaving[i].total_patient*62;
                    this.totalMedicationSavings = this.currentUser.listTotalMonthPatientSaving[i].total_patient * 62;

                }
            } else {
                this.totalMedicationSavings = 0;
            }

            if (this.currentUser.listSwitched != null && this.currentUser.listSwitched.length > 0) {
                for (var i = 0; i < this.currentUser.listSwitched.length; i++) {

                    // this.patientArr[this.currentUser.listTotalMonthPatientSaving[i].month - 1]=this.currentUser.listTotalMonthPatientSaving[i].total_patient*62;
                    this.totalSwitchedPatients += this.currentUser.listSwitched[i].total_patient;

                }
            } else {
                this.totalSwitchedPatients = 0;
            }
            
            // console.log(this.totalMedicationSavings)
            this.setPositiveMessages();
            if (this.currentUser.total_point > 100000) {
                this.pointShowInChart = this.currentUser.total_point - (Math.floor(this.currentUser.total_point / 100000) * 100000);
            }
            else {
                this.pointShowInChart = this.currentUser.total_point
            }
            if ((this.totalMedicationSavings) > 100000) {
                this.totalMedicationSavings = this.totalMedicationSavings - (Math.floor((this.totalMedicationSavings / 100000)) * 100000);
            }
            else {
                this.totalMedicationSavings = this.totalMedicationSavings;
            }

            this.usingcontract = this.currentUser.listTotalMonthPatientSaving[this.currentUser.listTotalMonthPatientSaving.length -1].total_patient;
            this.switched = this.currentUser.listSwitched[this.currentUser.listSwitched.length -1].total_patient;
            this.notswithced =  this.currentUser.listNotContracted[this.currentUser.listNotContracted.length -1].total_patient;
            this.allcontract = this.usingcontract + this.switched + this.notswithced;
            //
            this.doughnutChartData = [((this.usingcontract/this.allcontract)* 100).toFixed(), ((this.switched/this.allcontract)* 100).toFixed(), ((this.notswithced/this.allcontract)* 100).toFixed()];
            this.total_MedicationSaving = '$' + numeral(this.totalMedicationSavings).format('0,0');
            this.doughnutChartLabels = ['Using Contracted:'+ ((this.usingcontract/this.allcontract)* 100).toFixed() , 'Not Using Contracted:'+ ((this.notswithced/this.allcontract)* 100).toFixed() , 'Switched:'+ ((this.switched/this.allcontract)* 100).toFixed()];
       


        }
        else {
            this.currentUser = {
                listTotalPatientPerMonth:null,

                listSwitched:null,
                listNotContracted:null,
                token:0,
                totalDayPatient:0,
                total_patient:0,
                total_point: null,
                day_point: null,
                listTotalMonthPatientSaving: null,
                month_point: null,
                survey_day: {
                    expected_patients: null
                },
                full_name: null
            }
        }
        let url = this.router.url;
        if (url == '/dashboard/home/overview') {
            this.chartOption();
        }
    }
    getQuotes() {
        return this.http_method.callApi(this.baseUrl + 'quotes/getquotes').subscribe(
            (res: any) => {
                this.checkAccessdenied(res);
                this.quotes = JSON.parse(res._body).Data;
                this.commonDataService.setQuotes(this.quotes);
            },
            (error: any) => { });
    }
    //set option chart
    chartOption() {
        let max = 100000;
        if (this.totalMedicationSavings < 1000) {
            max = 1500;
        } else {
            max = (this.totalMedicationSavings / 1000) * 1500;
        }
        if (max > 100000) {
            max = 100000;
        }
        // Highcharts.chart('container', {
        //     chart: {
        //         type: 'column',

        //     },
        //     title: {
        //         text: 'Patient savings <br/>' + '$' + numeral(this.totalMedicationSavings).format('0,0'),
        //     },
        //     xAxis: {
        //         categories: ['Medication savings']
        //     },
        //     yAxis: {
        //         min: 0,
        //         max: max,
        //         title: {
        //             text: 'medication savings'
        //         }
        //     },
        //     tooltip: {
        //         pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b><label>$</label>{point.y} </b><br/>',
        //         shared: true
        //     },
        //     plotOptions: {
        //         column: {
        //             stacking: 'pointPadding'
        //         }
        //     },
        //     series: [{
        //         name: 'Medication Savings',
        //         data: [this.totalMedicationSavings],
        //         pointWidth: 200
        //     }]


        // });
    }
    checkAccessdenied(res: any) {
        console.log('~~~~~ ' + JSON.parse(res._body).Status );
        if (JSON.parse(res._body).Status == "access is denied") {
            localStorage.clear();
            this.router.navigate(['/', 'login']);
        }
    }
    requestErr() {
        localStorage.clear();
        this.router.navigate(['/', 'login']);
    }
    test() {
        // console.log('a');
        return this.http_method.callApiTest(this.baseUrl + 'test').subscribe(
            (res: any) => {

            },
            (error: any) => { });
    };
    changeStep(step:number){
        this.currentStep = step;
    }
    closeStartTour(){
       
        localStorage.setItem('opened_startTour','1');
        $("#media-video").get(0).pause();
    }
    startTour(){
        localStorage.setItem('opened_startTour','1');
        this._tooltip.tourStart();
        $("#media-video").get(0).pause();
    }
}

