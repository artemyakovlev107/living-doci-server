import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpMethod } from "../shared/services/http.method";
declare var $: any;
@Component({
    moduleId: module.id,

    selector: 'super-admin',
    templateUrl: 'super-admin.component.html',
})
export class SuperAdminComponent implements OnInit {
    checkUser: boolean;
    http_method: any;
    baseUrl: string;
    responseData: any;
    username: string = null;
    constructor(private router: Router, http_method: HttpMethod) {
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        if (sessionStorage.getItem('admin')) {
            this.username = JSON.parse(sessionStorage.getItem('admin')).full_name;
        }
        // console.log(this.username);
    }
    check() {
        if (sessionStorage.getItem('admin')) {
            this.username = JSON.parse(sessionStorage.getItem('admin')).full_name;
            return true;
        } else {
            return false;
        }
    }

    ngOnInit() {
        this.hideTop()
    }
    logout() {
        sessionStorage.clear();
        this.http_method.callApi(this.baseUrl + 'user/logout').subscribe(
            (response: any) => {
                this.responseData = JSON.parse(response._body);
                if (this.responseData.Status == 'success') {
                    this.checkUser = false;
                    sessionStorage.removeItem('admin');
                    this.router.navigate(['admin/login']);
                }
            })
    }
    hideTop() {
        $('.topnav-navbar').hide();
        $('.main-container').css({ 'padding-top': 0 });
    }

}
