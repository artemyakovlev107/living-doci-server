import { CommonDataService } from './shared/services/common-data.service';
import { Component } from '@angular/core';
import './operators';
import { HttpMethod } from "./shared/services/http.method";
import { Router } from '@angular/router';
declare var window: any;
declare const $:any;
/**
 * This class represents the main application component.
 */
@Component({
  moduleId: module.id,
  selector: 'mApp',
  templateUrl: 'app.component.html',
  providers: [HttpMethod],
  styleUrls: ['app.component.css']
})
export class AppComponent {
  baseUrl: string;
  errorMessage: string = "";
  currentLocationId: number = 0;
  http_method: any;
  timezone: any;
  notification: any;
  bodyNotification: string;
  seenNotification: any;
  listNotification: Array<string>;
  weeklyResult: {
    patientNumber: number,
    patientToGoal: number,
    patientSaving: number,
  };
  loading: boolean = false;
  constructor(http_method: HttpMethod, private router: Router, private commonData: CommonDataService) {
    router.events.subscribe((val)=>{
      $('.modal').modal('hide');
      $('.modal-backdrop').hide();
     
    })
    this.commonData.loading.subscribe((data) => {
      this.loading = data;
    });
    
    this.http_method = http_method;
    this.baseUrl = this.http_method.baseUrl;
    this.setLastUsingTime();
    if (localStorage.getItem('seenNotification')) {
      this.seenNotification = localStorage.getItem('seenNotification');
    } else {
      localStorage.setItem('seenNotification', 'false');
      this.seenNotification = 'false';
    }
    this.listNotification = [
      "NEED IMPROVEMENT \nIt looks like you aren’t using the software on a regular basis. Please let us know what we can do to help",
      "MAKING PROGRESS \nYou are doing well. Keep using the software to move to the next level.",
      "GREAT JOB \nYou are a top performer! Management has been notified of your success. Keep up the great work!"
    ];
    this.getDataReport();
  }
  setLastUsingTime() {
    this.timezone = new Date().getTimezoneOffset() / -60;
    if (localStorage.getItem('currentLocation') != null) {
      this.currentLocationId = JSON.parse(localStorage.getItem('currentLocation')).id;
      return this.http_method.callApiHadParram(this.baseUrl + "user/lastusingtime?hcf_location_id=" + this.currentLocationId + "&time_zone=" + this.timezone).subscribe(
        (res: any) => {
          setTimeout(() => {
            this.setLastUsingTime();
          }, 60000);
        },
        (error: any) => {
          this.setLastUsingTime();
        });
    }

  };
  requestPermission() {
    this.notification = window.Notification || window.mozNotification || window.webkitNotification;
    // console.log(this.notification);
    if ('undefined' === typeof this.notification)
      alert('Web notification not supported');
    else {
      this.notification.requestPermission((permission: any) => {
        this.checkCondition();
      });
    }
  };
  Notify(titleText: string, bodyText: string) {
    if ('undefined' === typeof this.notification)
      return false;       //Not supported....
    var noty = new this.notification(
      titleText, {
        body: bodyText,
        dir: 'auto', // or ltr, rtl
        lang: 'EN', //lang used within the notification.
        tag: 'notificationPopup', //An element ID to get/set the content
        icon: '../../assets/images/doc_and_i_icon.png' //The URL of an image to be used as an icon
      }
    );
    noty.onclick = function () {
      // console.log('notification.Click');
    };
    noty.onerror = function () {
      // console.log('notification.Error');
    };
    noty.onshow = function () {
      // console.log('notification.Show');
    };
    noty.onclose = function () {
      this.seenNotification = 'true';
    };
    return true;
  };
  checkCondition() {

    if (localStorage.getItem('currentUser')) {
      let day = new Date().getDay();
      if (day != 5) {
        localStorage.setItem('seenNotification', 'false');
      }
      if (this.seenNotification == 'false') {
        this.Notify('Doc&I Progression Weekly Report ', this.bodyNotification);
      }
    }
  };
  getDataReport() {
    return this.http_method.callApi(this.baseUrl + "user/weeklyreport").subscribe((res: any) => {
      this.weeklyResult = JSON.parse(res._body).Data;
      if (this.weeklyResult.patientNumber <= this.weeklyResult.patientToGoal * 0.33) {
        this.bodyNotification = this.listNotification[0];
      } else if (this.weeklyResult.patientNumber >= this.weeklyResult.patientToGoal * 0.33 && this.weeklyResult.patientNumber <= this.weeklyResult.patientToGoal * 0.66) {
        this.bodyNotification = this.listNotification[1];
      } else {
        this.bodyNotification = this.listNotification[2];
      };
      this.requestPermission();
    });
  };
  checkAccessdenied(res: any) {
    if (JSON.parse(res._body).Status == "access is denied") {
      localStorage.clear();
      this.router.navigate(['/', 'login']);
    }
  }
}
