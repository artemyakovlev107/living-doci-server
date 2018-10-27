import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {HttpMethod} from "../services/http.method";
declare var $ : any;
@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.html',
    providers: [ HttpMethod]
})

export class SidebarComponent {
    isActive = false;
    showMenu:string = '';

    baseUrl = 'https://doc-and-i-api.herokuapp.com/api/v1/';
    errorMessage:string;
    http:any;
    userName = localStorage.getItem('name');
    currentUser:{image_url:any};

    constructor(private router:Router) {
        this.currentUser = {
            image_url:'',
        }
        if (localStorage.getItem('user_id') && localStorage.getItem('user_id') != 'null') {
            this.getAccountInfo(localStorage.getItem('user_id'));
        }
    }
 
    eventCalled() {
        this.isActive = !this.isActive;
    }

    addExpandClass(element:any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    getAccountInfo(id:any) {
        return this.callApi(this.baseUrl + 'users/' + id).subscribe(
            (user:any) => this.currentUser = JSON.parse(user._body),
            (error:any) => this.errorMessage = <any>error);
    }

    rtl():void {
        var body:any = $('body');
        body.toggleClass('rtl');
    }

    sidebarToggler():void {
        var sidebar:any = $('#sidebar');
        var mainContainer:any = $('.main-container');
        sidebar.toggleClass('sidebar-left-zero');
        mainContainer.toggleClass('main-container-ml-zero');
    }

    isAdmin() {
        return localStorage.getItem('role') == 'doc_and_i_admin';
    }

    isLoggedIn() {
        return localStorage.getItem('user_id') != null;
    }

    isAssociated() {
        return this.isLoggedIn() && localStorage.getItem('hcf_id') != 'null';
    }

    goToLogin() {
        this.sidebarToggler();
        this.router.navigate(['/', 'login']);
    }

    goToHome() {
        this.sidebarToggler();
        this.router.navigate(['/', 'home']);
    }

    logout() {
        this.sidebarToggler();
        return this.deleteApi(this.baseUrl + 'sign_out').subscribe(
            () => {
                localStorage.clear();

                this.router.navigate(['/', 'login']);

            },
            (error:any) => this.errorMessage = <any>error);
    }

    deleteApi(url:any) {
        this.errorMessage = '';
        return this.http.delete(url);
    }

    callApi(url:any) {
        this.errorMessage = '';
        return this.http.get(url);
    }

}
