//import "jquery";
declare var $:any;
declare var Highcharts:any;
import {Component,OnInit,Injectable} from '@angular/core';
import {RouterModule,Router} from '@angular/router';

import {Observable} from 'rxjs';

import {HttpMethod} from "../../../shared/services/http.method";
import {UserDataService} from "../../../shared/services/userdata.services";
import {TopNavComponent} from "../../../shared/topnav/topnav";
import { HandleTooltipService } from '../../../shared/services/handleTooltip.service';
@Component({    moduleId: module.id,

    templateUrl: 'my-achievements.html',
    selector: "my-achievements",
    providers: [HttpMethod, TopNavComponent]
})

export class MyAchievementsComponent implements OnInit {
    
    options: Object;
    isActive = false;
    showMenu: string = '';
    baseUrl: string;
    errorMessage: string = "";   
    http_method: any;
    topnav:any;
    userName = localStorage.getItem('name');
    currentUser : {
        id:number,
        total_point:number,
        day_point:number,
        token:number,
        listTotalPatientPerMonth:Array<{month:number,total_patient:number}>,
        listTotalMonthPatientSaving:Array<{month:number,total_patient:number}>,
        listSwitched:Array<{month:number,total_patient:number}>,
        listNotContracted:Array<{month:number,total_patient:number}>,
        month_point:number,
        survey_day:{
            expected_patients:number
        },
        avatarUrl:string,
        health_care_facility_id:string,
        backgroundUrl:string
    }
    currentClinic:Object= {};
    currentCost:number;
    totalTokens: number;
    listCategory: any;
    listAvatarBought: Array < {id:number,reward_category_id:number} > ;
    listAvatarBoughtDisplay:Array<{id:number,reward_category_id:number}>;
    listAvatar:Array < {id:number} >;
    listBackground:Array < {id:number} >;
    listBackgroundBought:Array < {id:number} >;
    listAvatarDisplay: Array <{
        id:number
    }>;
    listCategoryDisplay:Array<{
        id:number,
    }>;
    typeShop:string;
    flagCategory:number;
    patientArr:Array<number>;
    listSwitched:Array<number>;
    listNotContracted:Array<number>;
    totalPatient:number=0;
    idAvatarPurchase:number;
    statusPurchase:string;

    itemToPurchase:{id:number,cost:number};
    userDataStore: Observable<Object>;
    avatarToChange:{id:number,url:string};
    idAvatarChoosed:number;
    oldBackground:string;    
    currentYear:number;
    month_point:any;
    total_point:any;
    pageView:any;
    stepView:any;
    ngOnInit() {
       
        this._userdataServices.userdata.subscribe( (val:any) => {
             this.userDataStore = val;
            if(val){
                // this.totalPatient = 0;
                this.currentUser = val;
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
              
                this.month_point = this.currentUser.month_point;
                this.total_point = this.currentUser.total_point;
                this.getCategoryPointShop();
                this.getAvatarbyUserId(this.currentUser.id);
                this.getAllAvatar();
                this.getAllBackground();
                this.getBackgroundbyUserId();
                
            }
            else {
                this.currentUser = {
                    id:null,
                    total_point:null,
                    day_point:null,
                    token:null,
                    listTotalPatientPerMonth:null,
                    listTotalMonthPatientSaving:null,
                    listSwitched:null,
                    listNotContracted:null,
                    month_point:null,
                    survey_day:{
                        expected_patients:null
                    },
                    avatarUrl:null,
                    health_care_facility_id:null,
                    backgroundUrl:null
                }
            }
        });
        
    }
    ngAfterViewInit() {
        this.chartOption();
    }
    constructor(http_method: HttpMethod, private router: Router,topnav:TopNavComponent, 
        private _userdataServices:UserDataService,private _tooltip: HandleTooltipService) {
        this.currentYear = new Date().getFullYear();
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.topnav = topnav;

        this.patientArr = [0,0,0,0,0,0,0,0,0,0,0,0];
        this.listSwitched = [0,0,0,0,0,0,0,0,0,0,0,0];
        this.listNotContracted = [0,0,0,0,0,0,0,0,0,0,0,0];

        if (localStorage.getItem('currentUser')) {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (this.currentUser.total_point != null) {
                this.totalTokens = this.currentUser.token;
            } else {
                this.totalTokens = 0;
            }
        }
        else{
             localStorage.clear();
             this.router.navigate(['/', 'login']);
        }
        if (localStorage.getItem('currentClinic')) {
            this.currentClinic = JSON.parse(localStorage.getItem('currentClinic'));
           
        }
        else{
             localStorage.clear();
             this.router.navigate(['/', 'login']);
        }
        
        this.typeShop ="avatar";
        this.listCategory = [];
        this.listAvatar = [];
        this.listAvatarDisplay = [];
        this.listCategoryDisplay = [];
        this.listBackgroundBought = [];
        this.listAvatarBought = [];
        this.listBackground = [];
        this.listAvatarBoughtDisplay=[];
       
        this.idAvatarChoosed = 0;
        this._tooltip.exportTooltip.subscribe( data =>{           
            this.pageView = data.page;
            this.stepView = data.active;
          
        })
    }
    chartOption(){
           
        let width:any = $('.achi-padding__row').width();
        Highcharts.chart('container', {
            title: {
            text: 'Patients Helped<br />Since Jan 1 '+this.currentYear,
            x: -20 //center
            },
            chart: {
                width: width,
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
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0,
                enabled:true
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
    //get Category in pointShop
    getCategoryPointShop() {
        return this.http_method.callApi(this.baseUrl + "reward/listcategorypointshop").subscribe(
            (response:any) => {
                this.checkAccessdenied(response);
                this.listCategory = JSON.parse(response._body).Data;
      
                this.listCategoryDisplay = this.listCategory.filter( (s:any)=> s.reward_type == 1);
                this.flagCategory = this.listCategoryDisplay[1].id;
            },
            (error:any) => this.getCategoryPointShop());
    }
    //get Avatar in category
    getAvatar(categoryId:any) {
        this.flagCategory = categoryId;
        this.listAvatarDisplay = this.listAvatar.filter( (s:any)=> s.reward_category_id == categoryId);
    }
    getAvatarBought(categoryId:any){
        this.flagCategory = categoryId;
        this.listAvatarBoughtDisplay = this.listAvatarBought.filter( (s:any)=> s.reward_category_id == categoryId);
    }
    changeTypeShop(type:any){
        this.typeShop = type;
        if(type=='avatar') {
             this.listCategoryDisplay = this.listCategory.filter( (s:any)=> s.reward_type == 1);
              this.flagCategory = this.listCategoryDisplay[1].id;
        this.getAvatar(this.listCategoryDisplay[1].id);
        }
        else{
            this.listCategoryDisplay = this.listCategory.filter( (s:any)=> s.reward_type == 2 );
            this.listAvatarDisplay = this.listBackground;
        }
       
    }
    //get avatar by userID
    getAvatarbyUserId(userId:any) {
        return this.http_method.callApiHadParram(this.baseUrl + "user/listavatar?userId=" + userId).subscribe(
            (response:any) => {
                this.checkAccessdenied(response);
                this.listAvatarBought = JSON.parse(response._body).Data;
               
            },
            (error:any) => this.errorMessage = <any>error);
    }
    //get All avatar
    getAllAvatar(){
         return this.http_method.callApi(this.baseUrl + "reward/allavatar").subscribe(
             (response:any) => {
                 this.checkAccessdenied(response);
                this.listAvatar = JSON.parse(response._body).Data;
            },
             (error:any) => {this.getAllAvatar()});
    }
    //get All background
    getAllBackground(){
         return this.http_method.callApi(this.baseUrl + "reward/getallbackground").subscribe(
             (response:any) => {
                 this.checkAccessdenied(response);
                this.listBackground = JSON.parse(response._body).Data;
            },
             (error:any) => {this.getAllBackground()});
    }
    //get background by userID
    getBackgroundbyUserId() {
        return this.http_method.callApi(this.baseUrl + "reward/getlistuserbackground").subscribe(
            (response:any) => {
                this.checkAccessdenied(response);
                this.listBackgroundBought = JSON.parse(response._body).Data;
            },
            (error:any) => this.getBackgroundbyUserId());
    }
    //showmodal
    showmodal(){
        if(this.typeShop=='avatar') {
             this.listAvatarDisplay = this.listAvatar.filter( (s:any)=> s.reward_category_id == this.flagCategory);
        }
        else{
            this.listAvatarDisplay = this.listBackground;
        }
    }

    showmodalById(elementId:string){

        if(this.typeShop=='avatar') {
            this.listAvatarDisplay = this.listAvatar.filter( (s:any)=> s.reward_category_id == this.flagCategory);
        }
        else{
            this.listAvatarDisplay = this.listBackground;
        }

        $("#"+elementId).modal({backdrop: 'static',show:true});
    }

    showMyavatar(){
        this.listAvatarBoughtDisplay = this.listAvatarBought.filter( (s:any)=> s.reward_category_id == this.flagCategory);
    }
    //changeAvatar
    chooseAvatarToChange(item:any){
        
        this.avatarToChange = item;
        this.idAvatarChoosed = item.id;
        // console.log(this.avatarToChange);
        if(item.reward_type == 2){
           this._userdataServices.updateBackground(item.url); 
        }
    }
    changeAvatar(){
        return this.http_method.callApiHadParram(this.baseUrl + "user/changeavatar?avatar_id="+this.avatarToChange.id).subscribe(
            (response:any) => {
                this.checkAccessdenied(response);
                if(JSON.parse(response._body).Status == "success"){
                    this.getAccountInfo();
                    this.currentUser.avatarUrl = this.avatarToChange.url;
                    this._userdataServices.updateAvatar(this.avatarToChange.url);
                    this.getClinic(this.currentUser.health_care_facility_id);
                    this.avatarToChange = null;
                }
            },
            (error:any) => this.errorMessage = <any>error);
    }
    cancelChange(value:any){
        this.avatarToChange = null;
        if(value=='background'){
            this._userdataServices.updateBackground(this.oldBackground); 
        }
        
    }
     changeBackground(){

         return this.http_method.callApiHadParram(this.baseUrl + "user/changebackground?background_id="+this.avatarToChange.id).subscribe(
             (response:any) => {
                 this.checkAccessdenied(response);
                 if(JSON.parse(response._body).Status == "success"){
                    this.getAccountInfo();
                     this._userdataServices.updateBackground(this.avatarToChange.url);
                     this.avatarToChange = null;
                      $('#my-background').modal('hide');
                 }
            },
             (error:any) => this.errorMessage = <any>error);
    }
    
    getAccountInfo() {
        return this.http_method.callApi(this.baseUrl+"users/getuserdetails").subscribe(
            (user:any) => {
                this.checkAccessdenied(user);
                this.currentUser = JSON.parse(user._body).Data;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            },
            (error:any) => this.errorMessage = <any>error);
    }
    chooseItemToPurchase(item:any){
        if(item.owned == '0'){
             this.itemToPurchase = item;
             this.idAvatarChoosed=item.id;
            // console.log(this.itemToPurchase);
        }        
    }
    //modal Confirm Purchase
    modalConfirmPurchase(){
        
            $('#purchase').modal({show:true});
            this.idAvatarPurchase = this.itemToPurchase.id;
            this.currentCost = this.itemToPurchase.cost;
        
           }
    purchase(){
       return this.http_method.callApiHadParram(this.baseUrl + "reward/exchangereward?reward_id="+this.idAvatarPurchase).subscribe(
           (response:any) => {
               this.checkAccessdenied(response);
               $('#modal').modal('hide');
               $('#purchase').modal('hide');
               
              if(JSON.parse(response._body).Status == "success"){
                 this.totalTokens = this.totalTokens-this.currentCost;
                  this.getAvatarbyUserId(this.currentUser.id);
                this.getAllAvatar();
                this.getAllBackground();
                this.getBackgroundbyUserId();
                this.getAccountInfo();
                   this.statusPurchase = "successfully Purchased!"
              }
              else{
                  this.statusPurchase = "You do not have enough token!"
              }
              $('#statusPurchase').modal({show:true}); 
              
            },
           (error:any) => this.errorMessage = <any>error);
    }
    getClinic(id:any) {
        return this.http_method.callApi(this.baseUrl + 'health_care_facilities/gethcfdetails').subscribe(
            (clinic:any) => {
                this.checkAccessdenied(clinic);
                this.currentClinic = JSON.parse(clinic._body).Data;
                localStorage.setItem('currentClinic', JSON.stringify(this.currentClinic));
            },
            (error:any) => this.errorMessage = <any>error);
    }
    setOldBackground(){
        this.oldBackground = this.currentUser.backgroundUrl;
    }
    checkAccessdenied(res:any){
        if(JSON.parse(res._body).Status=="access is denied"){
            localStorage.clear();
            this.router.navigate(['/', 'login']);
        }
    }
     
}