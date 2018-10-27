import { Component, ViewEncapsulation, Injectable, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from "rxjs";
import { HttpMethod } from "../services/http.method";
import { UserDataService } from "../services/userdata.services";
import { HandleTooltipService } from '../services/handleTooltip.service';
import { window } from 'rxjs/operators/window';
// import {ThreeFortyBComponent} from "../../+three-forty-b/340b.component";

declare var $: any;
@Component({
    moduleId: module.id,

    selector: 'top-nav',
    templateUrl: 'topnav.html',
    styleUrls: ['./topnav.css'],
    encapsulation: ViewEncapsulation.None,
    providers: [HttpMethod]
})
export class TopNavComponent implements OnInit {
    baseUrl: string;
    currentMenu: string;
    // three40B:any;
    errorMessage: any;
    userName: any = localStorage.getItem('name');
    currentUser: {
        avatarUrl: string,
        role: number,
        id: number,
        login_token: string
    };

    currentLocation: {
        image_url: string;
    }
    http_method: any;
    test: string = "chua thay doi";
    pageView: any;
    stepView: any;
    listUser: Observable<Object[]>;
    userDataStore: Observable<
        {
            avatarUrl: string,
            role: number,
            id: number,
            login_token: string
        }>;
    showConfirmed: boolean = false;
    confirm1:boolean = false;
    confirm2:boolean = false;
    confirm3:boolean = false;
    ngOnInit() {
        this._userdataServices.userdata.subscribe((val: any) => {
            console.log("console.log(val);");
            console.log(val);
            this.userDataStore = val;

            this.currentUser = val;//this.userDataStore;
            this.isAdmin();
            // console.log(this.currentUser)
        });

        this._userdataServices.loggedInUsers.subscribe((val: any) => {
            this.listUser = val;
        });
        // console.log("list users: ", this.listUser);

    }

    constructor(private router: Router, http_method: HttpMethod, private _userdataServices: UserDataService, private zone: NgZone, private _tooltip: HandleTooltipService) {
        this.currentUser = {
            avatarUrl: "",
            role: 0,
            id: null,
            login_token: ""
        }
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!this.currentUser) {
            this.currentUser = {
                avatarUrl: "",
                role: 0,
                id: null,
                login_token: null
            };
            this.currentUser.avatarUrl = "a";
        }
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        router.events.subscribe((val: any) => {
            this.currentMenu = val.urlAfterRedirects;
        });
        this._tooltip.exportTooltip.subscribe(data => {
            this.pageView = data.page;
            this.stepView = data.active;
        })
        this._tooltip.endTourModal.subscribe(data => {
            if (data) {
                this.openModal('verifyModal1');
            }

        })
        this.currentLocation = JSON.parse(localStorage.getItem('currentLocation'));    
      
    }
    hideModalConfirm(){
        this._tooltip.closeEndTour();
        this._tooltip.showTour();
    }
    getListUser() {
        this.listUser = JSON.parse(localStorage.getItem('listUser'));
        // console.log(this.listUser)
    }

    changeTheme(color: string): void {
        // var link: any = $('<link>');
        // link
        //     .appendTo('head')
        //     .attr({type: 'text/css', rel: 'stylesheet'})
        //     .attr('href', 'themes/app-' + color + '.css');
    }

    rtl(): void {
        // var body: any = $('body');
        // body.toggleClass('rtl');
    }

    sidebarToggler(): void {
        var sidebar: any = $('#sidebar');
        var mainContainer: any = $('.main-container');
        sidebar.toggleClass('sidebar-left-zero');
        mainContainer.toggleClass('main-container-ml-zero');
    }

    isAdmin() {
        if (this.currentUser) {
            return this.currentUser.role != 0;// localStorage.getItem('role') == 'doc_and_i_admin';
        }
        else {
            return false;
        }

    }

    isLoggedIn() {
        return localStorage.getItem('user') != null;
    }
    isUpload(){
        if(localStorage.getItem('user')){
            let user:any = JSON.parse(localStorage.getItem('user'));
            if(user.role == 4){
                return true;
            }
        }
        return false;
    }
    isAssociated() {
        return this.isLoggedIn() && localStorage.getItem('hcf_id') != 'null';
    }

    goToLogin() {
        this.router.navigate(['/', 'login']);
    }

    goToHome() {
        this.router.navigate(['/home']);
    }

    gotoManagerUser() {
        this.router.navigate(['/', 'admin/manage-users']);

    }

    goTo340b() {
        this.router.navigate(['/340b']);
        // this.three40B.changeShowMap();

    }

    gotoMyClinic() {
        this.router.navigate(['/dashboard/my-clinic']);
    }

    gotoMyPharmacies() {
        this.router.navigate(['/dashboard/my-pharmacies']);
    }

    gotoContractedPharmacies() {
        this.router.navigate(['/dashboard/contracted-pharmacies']);
    }

    logout() {

        return this.http_method.callApi(this.baseUrl + 'user/logout').subscribe(
            () => {
                this._tooltip.resetTooltip();
                this.router.navigate(['/', 'login']);
                localStorage.clear();

            },
            (error: any) => {
                this.errorMessage = error;
                this.router.navigate(['/', 'login']);
            });
    }

    changeAvatar(url: string) {

    }

    openSwitchUserPopup() {
        //debugger;
        this.getListUser();
        $('#modal-switch').modal('show');
    }
    addAccount() {
        this.router.navigate(['/', 'login']);
        $('#modal-switch').modal('hide');
    }

    doSwitchUser(userId: number) {
        this._userdataServices.setCurrentUser(userId);
        this.switchUser(this.currentUser.id, this.currentUser.login_token);
    }
    log(ms: string) {
        // console.log(ms)
    }

    switchUser(id: number, token: string) {
        return this.http_method.postApi(this.baseUrl + 'user/switchuser', { userId: id, login_token: token }).subscribe(
            (response: any) => {
                this.checkAccessdenied(response);

            },
            (error: any) => {

            });
    }
    checkAccessdenied(res: any) {
        if (JSON.parse(res._body).Status == "access is denied") {
            localStorage.clear();
            this.router.navigate(['/', 'login']);
        }
    }
    openModal(id: any) {        
        $('#verifyModal1').data('bs.modal',null);  
        $(`#${id}`).modal({
            show: 'true',
            backdrop: 'static',
            keyboard: false
        });
       
    }
    tourAgain(step: number) {
       
        $('#docHelpModal').modal('hide');
        $('#verifyModal1').data('bs.modal',null);  
        $('#verifyModal1').modal('hide'); 
        this._tooltip.tourAgain(step);
    }
    confirmed(){
        this.http_method.callApi(this.baseUrl+'user/completetutorial').subscribe((res:any)=>{
            let result = res.json();
            let completed_tutorial:any = 1;
            localStorage.setItem('completed_tutorial',completed_tutorial);
            location.reload();
        })
    }

}

