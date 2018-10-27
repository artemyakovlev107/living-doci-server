import { CommonDataService } from './../shared/services/common-data.service';

import { Component, OnInit} from '@angular/core';

import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { UserData } from "../shared/services/userdata.interface";
import { HttpMethod } from "../shared/services/http.method";
import { UserDataService } from "../shared/services/userdata.services";
import { AppComponent } from "../app.component";
import { HandleTooltipService } from '../shared/services/handleTooltip.service';
/**
 * This class represents the lazy loaded LoginComponent.
 */
//import $ from "jquery";
declare var $: any;

@Component({
    moduleId: module.id,
    selector: 'login-cmp',
    templateUrl: 'login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [HttpMethod, AppComponent]
})
export class LoginComponent implements OnInit {
    user: { Data: any, role: any, Message: string, Status: string, listHcfLocation: Array<any> };
    baseUrl: string;
    errorMessage: string = null;
    userName: string;
    password: string;
    appComponent: any;
    currentUser: {
        Data: {
            id: any
        }
    };
    currentClinic: {
        Data: any
    };
    currentLocation: {
        id: any;
    }
    listClinic: Array<Object>;
    http_method: any;
    listUser: Array<Object>;
    userDataStore: Observable<Object>;
    loading: boolean = false;
    ngOnInit() {

    }

    constructor(private commonService: CommonDataService, private router: Router, http_method: HttpMethod, private _userdataServices: UserDataService,
        appComponent: AppComponent, private _tooltip: HandleTooltipService) {
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.listClinic = [];
        this.appComponent = appComponent;
        if (localStorage.getItem('listUser')) {
            this.listUser = JSON.parse(localStorage.getItem('listUser'));
        }
        else {
            this.listUser = [];
        }

        let url = router.url;
        let email = url.split('=')[1];
        if (email) {
            this.userName = email.replace("%40", "@");
        }
    }
    login() {
        this.commonService.toggleLoading(true);
        console.log("logging~~");
        this.http_method.postApi(this.baseUrl + 'user/login', { email: this.userName, password: this.password }).subscribe(
            
            (response: any) => {
                console.log(response);
                this.user = response.json();

                if (this.user.Data != null) {
                    $('#chooseClinic').modal('show');
                    if (this.user.Data.completed_tutorial == 1) {
                        this._tooltip.hideTour();
                    }
                    this.getAccountInfo(this.user.Data.id);
                    if (this.user.Data.role != 4) {                        
                        this.getClinic();
                        this.groupPharmacyByCity();
                        this.listClinic = this.user.Data.listHcfLocation;
                        console.log(this.listClinic)
                        localStorage.setItem('listClinicLocation', JSON.stringify(this.listClinic));
                        localStorage.setItem('completed_tutorial', this.user.Data.completed_tutorial)
                        $('#chooseClinic').modal('show');
                        if (this.user.Data.completed_tutorial == 1) {
                            this._tooltip.hideTour();
                        }
                    } else {
                        localStorage.setItem('user', JSON.stringify(this.user.Data));
                        this.router.navigate(['/upload']);
                    }

                }
                if (this.user.Status == "error") {
                    this.errorMessage = this.user.Message;
                }
            },
            (error: any) => {
                this.errorMessage = error;
                this.errorMessage = 'Bad Login';
                this.commonService.toggleLoading(false);
            },
            () => {
                this.commonService.toggleLoading(false);
            }
        );

    }
    getAccountInfo(id: any) {
        return this.http_method.callApi(this.baseUrl + '/users/getuserdetails').subscribe(
            (user: any) => {
                this.currentUser = JSON.parse(user._body);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser.Data));
                this._userdataServices.updateFromLocalStorage();
                let flag = true;
                if (localStorage.getItem('listUser')) {
                    let listUser = JSON.parse(localStorage.getItem('listUser'));
                    this.listUser = listUser;
                    for (let i = 0; i < listUser.length; i++) {
                        if (listUser[i].id == this.currentUser.Data.id) {
                            flag = false;
                            break;
                        }
                    }

                    if (flag) {
                        this.listUser.push(this.currentUser.Data);
                    }
                    localStorage.setItem('listUser', JSON.stringify(this.listUser));
                }
                else {
                    this.listUser.push(this.currentUser.Data);
                    localStorage.setItem('listUser', JSON.stringify(this.listUser));
                }
            },
            (error: any) => { });
    }
    getClinic() {
        return this.http_method.callApi(this.baseUrl + 'health_care_facilities/gethcfdetails').subscribe(
            (clinic: any) => {
                this.currentClinic = JSON.parse(clinic._body);
                localStorage.setItem('currentClinic', JSON.stringify(this.currentClinic.Data));
            },
            (error: any) => { });
    }
    // getListClinicLocation() {
    //     return this.http_method.callApi(this.baseUrl + "health_care_facilities/getlisthcflocations").subscribe(
    //         (res: any) => {
    //             this.listClinic = JSON.parse(res._body).Data;
    //             localStorage.setItem('listClinicLocation', JSON.stringify(this.listClinic));
    //             $('#chooseClinic').modal('show');
    //         },
    //         (error: any) => { this.getListClinicLocation(); });

    // }
    groupPharmacyByCity() {
        return this.http_method.callApi(this.baseUrl + "pharmacy/grouppharmacybycity").subscribe(
            (res: any) => {
                localStorage.setItem('groupPharmacyByCity', JSON.stringify(JSON.parse(res._body).Data));
            },
            (error: any) => { });
    }
    chooseClinic(clinic: any) {

        $('#chooseClinic').modal('hide');


        localStorage.setItem('user', JSON.stringify(this.user.Data));
        localStorage.setItem('currentLocation', JSON.stringify(clinic));
        this.currentLocation = clinic;



        this.router.navigate(['/dashboard/home', 'overview']);
        this.appComponent.setLastUsingTime();
    }
    requestErr() {
        localStorage.clear();
        this.router.navigate(['/', 'login']);
    }
    inputChange() {
        this.errorMessage = null;
    }

}
