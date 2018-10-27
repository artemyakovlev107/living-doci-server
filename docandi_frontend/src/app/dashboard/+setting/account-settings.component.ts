declare var $: any;
import { Component, OnInit } from '@angular/core';
import { HttpMethod } from "../../shared/services/http.method";
import { UserDataService } from "../../shared/services/userdata.services";
import { Router } from '@angular/router';
import {Observable} from "rxjs";
@Component({
    moduleId: module.id,
    selector: 'account-settings-cmp',
    templateUrl: 'account-settings.component.html',
})
export class AccountSettingsComponent implements OnInit {

    http_method: any;
    baseUrl: string;
    editPassword: boolean = false;
    oldPass: string;
    newPass: string;
    newPassConfirm: string;
    currentUser: {
        token:number,
        id:number,
        address: string,
        city: string,
        full_name: string,
        avatarUrl: string,
        backgroundUrl: string,
        email: string,
        health_care_facility_id:string,
    }
    listClinic: Array<Object>;
    mes: string = null;
    currentClinic:Object= {};
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
    errorMessage: string = ""; 
    typeShop:string;
    avatarToChange:{id:number,url:string};
    flagCategory:number;
    userDataStore: any;
    idAvatarChoosed:number;
    constructor(private _userdataServices: UserDataService, http_method: HttpMethod, private router: Router) {
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.listClinic = JSON.parse(localStorage.getItem('listClinicLocation'));

        
        this.typeShop ="avatar";
        this.listCategory = [];
        this.listAvatar = [];
        this.listAvatarDisplay = [];
        this.listCategoryDisplay = [];
        this.listAvatarBought = [];
        this.listAvatarBoughtDisplay=[];

    }
    resetInput() {
        this.oldPass = null;
        this.newPass = null;
        this.newPassConfirm = null;
    }
    ngOnInit() {
        // debugger
        this._userdataServices.userdata.subscribe((val: any) => {
            this.userDataStore = val;
            if (val) {

                this.currentUser = val;
                this.getCategoryPointShop();
                this.getAvatarbyUserId(this.currentUser.id);
                this.getAllAvatar();


            }
            else {
     
                this.currentUser = {
                    id:null,
                    address: '', city: '',
                    full_name: '',
                    avatarUrl: null,
                    backgroundUrl: null,
                    email: null,
                    token:null,
                    health_care_facility_id:null,
                   
                }
             }
        });
  
        // console.log(this.currentUser.avatarUrl)
    }
    showEdit() {
        this.editPassword = true;
    }
    cancelEdit() {
        this.editPassword = false;
        this.resetInput();
    }
    changePass() {
        this.http_method.postApi(this.baseUrl + 'user/changePassword', { 'email': this.currentUser.email, 'password': this.oldPass, 'newpassword': this.newPass }).subscribe(
            (response: any) => {
                this.resetInput();
                let res = JSON.parse(response._body);
                if (res.Status == "success") {
                    this.mes = "Change password success"
                    this.editPassword = false;
                    setTimeout(() => {
                        this.mes = null;
                    }, 2000);
                }
                else {
                    this.mes = res.Message;
                    setTimeout(() => {
                        this.mes = null;
                    }, 2000);
                }
            },
            (error: any) => {
                this.mes = error;
            });
    }

    //-----------
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
    checkAccessdenied(res:any){
        if(JSON.parse(res._body).Status=="access is denied"){
            localStorage.clear();
            this.router.navigate(['/', 'login']);
        }
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
     //get Avatar in category
     getAvatar(categoryId:any) {
        this.flagCategory = categoryId;
        this.listAvatarDisplay = this.listAvatar.filter( (s:any)=> s.reward_category_id == categoryId);
    }
    getAvatarBought(categoryId:any){
        this.flagCategory = categoryId;
        this.listAvatarBoughtDisplay = this.listAvatarBought.filter( (s:any)=> s.reward_category_id == categoryId);
    }
}
