

import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { Http, HttpModule, Headers, RequestOptions, JsonpModule } from '@angular/http';

@Injectable()
export class HttpMethod {
    // baseUrl:string = "http://api.docandi.uat.pgtest.co/";
    // baseUrl:string = "http://api3.docandi.uat2.pgtest.co:8080/";
    // baseUrl: string = "http://api.docandi.com/";
    // baseUrl: string = "http://ec2-54-193-46-165.us-west-1.compute.amazonaws.com/"; //current staging server
    baseUrl: string = "http://localhost/backend/docandi/public/";
    
   
    currentUser: { login_token: any };
    errorMessage: string = null;
    http: any;
    constructor(http: Http, private router: Router) {
        this.http = http;
    }
    callApi(url: string) {
        let headers = new Headers({ 'Content-Type': 'application/json'});
        let options = new RequestOptions({ withCredentials: true });
        let token = this.getLogintoken();
        url = url + "?loginToken=" + token;
        return this.http.get(url, options);
    }
    callApiHadParram(url: string) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ withCredentials: true });
        let token = this.getLogintoken();
        url = url + "&loginToken=" + token;
        return this.http.get(url, options);
    }
    callApiNoToken(url: string) {
        let options = new RequestOptions({ withCredentials: true });
        return this.http.get(url, options);
    }
    postApi(url: string, body: any) {
        let options = new RequestOptions({ withCredentials: true });
        this.errorMessage = '';
        let token = this.getLogintoken();
        body.loginToken = token;
        return this.http.post(url, body, options);
    } postApiNoToken(url: string, body: any) {
        let options = new RequestOptions({ withCredentials: true });
        return this.http.post(url, body, options);
    }
    putApi(url: string, body: any) {
        this.errorMessage = '';
        var bodyJSON = JSON.stringify(body);
        return this.http.put(url, bodyJSON);
    }
    postApiNotAuth(url: string, body: any) {
        return this.http.post(url, body);
    }   
    callApiNotAuth(url: string) {
        return this.http.get(url);
    }
    getLogintoken() {
        if (JSON.parse(localStorage.getItem('currentUser'))) {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            return this.currentUser.login_token;
        }
        else {
            return null;
        }
    }
    postApiFile(url: string, postData: any, files: File[]) {
        let options = new RequestOptions({ withCredentials: true });
        this.errorMessage = '';
        let formData: FormData = new FormData();
        formData.append('image', files[0], files[0].name);
        if (postData !== "" && postData !== undefined && postData !== null) {
            for (var property in postData) {
                if (postData.hasOwnProperty(property)) {
                    formData.append(property, postData[property]);
                }
            }
        }
        return this.http.post(url, formData, options);
    };
}
