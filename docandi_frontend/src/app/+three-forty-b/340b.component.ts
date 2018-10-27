


import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import 'rxjs/Rx';


import * as jQuery from 'jquery'
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import { UserDataService } from "../shared/services/userdata.services";
import { HttpMethod } from "../shared/services/http.method";
import { TopNavComponent } from "../shared/topnav/topnav";
import { findProblemCode } from 'codelyzer/angular/styles/cssLexer';
import { HandleTooltipService } from '../shared/services/handleTooltip.service';
import { concat } from 'rxjs/operators/concat';
import {formatDate } from '@angular/common';
import { DomSanitizer, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';

/**
 * This class represents the lazy loaded Three40BComponent.
 */

declare var $: any;

@Component({
    moduleId: module.id,
    selector: 'three40b-cmp',
    templateUrl: '340b.component.html',
    // template:'<agm-map [latitude]="lat" [longitude]="lng"></agm-map>',
    styles: [`
      agm-map {
            height: 100%;
            min-height: 500px;
            width: 100%;
            position:absolute;
            top:0;
            bottom:-200px;
            left:0;
            right:0;
            z-index:0;
          }
  `],
//   agm-map {
//     height: 800px;
//     min-height: 500px;
//     width: 100%;
//   }
// .sebm-google-map-container {
//     height: 800px;
//     min-height: 500px;
//     width: 100%;
//   }
    providers: [HttpMethod, TopNavComponent]
})

export class ThreeFortyBComponent {
    today:any;
    lat:number = 51.6;
    lng:number = 7.809;
    baseUrl: string;
    http_method: any;
    userDataStore: Observable<Object>;
    response: any;
    errorMessage: any;
    currentTab: string = 'start';
    currentPharmacy: string;
    currentSurvey: Object = {};
    isClinic: boolean;
    allPharmacies: Array<any>;
    // all_Pharmacies: Array<any>;
    contractedPharmacies: Array<any>;
    currentClinic: { id: number, Data: any, users: Array<Object>, introduction: any };
    editPharmacy: Object = {};
    surveySending: boolean = false;
    textSending: boolean = false;
    choosed: string;
    background: string;
    height: number = 700;
    typeSend: string = 'email';
    patientCapture: {
        is_using_340b: number,
        told_freedom_choice: number,
        agree_to_change: number,
        pharmacy_id: any,
        informed_340b_benefit: number,
        informed_pharmacy_location: number,
        alerted_doctor: number,
        reason: any,
        patient_phone: any,
        time_for_step_1: any,
        time_for_step_2: any,
        hcf_location_id: number,
        is_recommend: number,
        map_viewed: number;
        benefits_viewed: Array<{
            viewed: number,
            id: number,
        }>;
    };
    timeForStep: {
        step1: number,
        step2: number
    };
    questions: {
        q1: any,
        //yes
        q2: any,
        q3: any,
        //no
        q4: any,
        q5: any,
        //agree?
        q6: any,
        //yes
        q7: any,
        q8: any,
        q9: any,
        q10: any,
        //no
        q11: any,
        reason: any,
        text_consent: boolean
    };
    patient_intials: any; 
    change: boolean;
    selectedItem: number;
    itemStatus: string;
    listAddressLocation: Array<string>;
    http: any;
    selectedAdress = { id: 0 };
    phoneNumber: any;
    showNextStepBtn: boolean; // using to show Next Btn in marker popup
    reasons: Array<any> = [
        { id: 1, name: "Pharmacies are too far away" },
        { id: 2, name: "I am happy with my current pharmacy" },
        { id: -1, name: "Other" }
    ];
    totalPages: number = 0;
    currentPage: number = 0;

    clinics: Array<any>;

    typeAheadDataRef: any = this.getAsyncData.bind(this);
    searchString: string = '';
    typeaheadLoading: boolean = false;
    typeaheadNoResults: boolean = false;
    sortType: string;
    contactInfo: any;
    sendCard: any;
    sendPhar: any;
    messageSent: boolean = false;
    // google maps zoom level
    zoom: number = 13;
    // initial center position for the map
    currentLocation: {
        id: any,
        latitude: any,
        longitude: any
    };
    longitude: number;
    latitude: number;
    newCords: Object = {};
    showMap: boolean = false;
    survey_user = { survey_day: { expected_patients: 0, id: 0 }, todays_surveys: 0 };
    currentUser: { id: number, avatarUrl: string, Data: any, ư: string };
    listClinic: Array<any> = [];
    edit_expected_patients: number = 0;
    expected_patients_sending: boolean = false;
    update_survey_user_sending: boolean = false;
    direction: boolean = false;
    sub: any;
    listClinicLocation: Array<Object>;
    topnav: any;
    userID: number;
    clinicID: number;
    groupPhar: Array<{
        city: string
    }>
    selectedPhar: {
        id: number,
        city: string
    };
    listBenefit: Array<{
        viewed: number,
        id: number,
    }>;
    // currentFilter: number;
    collapseIndex: number;
    patientName: string = null;
    patientEmail: string = null;
    flagTimeStart: any = 0;
    flagTimeEnd: any = 0;
    currentClinic2: any;
    introduction: any;
    checkbox2: boolean;
    location_id: any;
    flagPharmacyId: any;
    pageView: any;
    stepView: any;

    selectedpharamcy:string;

    //-------------
    filterall: boolean;
    filterhours: boolean;
    filterdrive: boolean;
    filterdelivery: boolean;
    filtersync: boolean;
    filterself: boolean;
    //-------------
    filter0: number;
    filter1: number;
    filter2: number;
    filter3: number;
    filter4: number;
    filter5: number;

    
    constructor(private route: ActivatedRoute, private router: Router, http_method: HttpMethod, http: Http, topnav: TopNavComponent,
        private _userdataServices: UserDataService, private _tooltip: HandleTooltipService,private sanitizer:DomSanitizer) {
        // let  today: Date;
        this.http = http;
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.isClinic = true;
        this.topnav = topnav;
        this.timeForStep = {
            step1: 0,
            step2: 0
        };
        this.listAddressLocation = [];
        this.groupPhar = [];
        
        this.filterall = true;
        this.filter0 = 0;
        this.filter1 = 0;
        this.filter2 = 0;
        this.filter3 = 0;
        this.filter4 = 0;
        this.filter5 = 0;
        
        this.filterhours = false;
        this.filterdrive = false;
        this.filterdelivery = false;
        this.filtersync = false;
        this.filterself = false;

        this.currentLocation = JSON.parse(localStorage.getItem('currentLocation'));
        this.contractedPharmacies = []
        if (!this.currentLocation) {
            this.router.navigate(['/', 'home']);
        }
        else {
            this.handlingLocation();
            this.newSurvey();
            this.getContractedPharmacies(this.currentLocation.id);

        }
        // document.querySelector("#today").valueAsDate = new Date();
        this.listClinicLocation = JSON.parse(localStorage.getItem('listClinicLocation'));
        this.getAllPharmacy();
        this.latitude = 0;
        this.longitude = 0;
        this.selectedItem = 0;
        // this.currentFilter = 0;
        this.sortType = 'distance';
        this.showMap = true;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!this.currentUser) {
            this.router.navigate(['/', 'home']);
        }
        else {
            this.userID = this.currentUser.id;
        }
        
        this.choosed = "";
        this.groupPharmacyByCity();
        this.selectedAdress = null;
        this.openModal();
        if (localStorage.getItem('currentClinic')) {
            this.currentClinic = JSON.parse(localStorage.getItem('currentClinic'));
            this.clinicID = this.currentClinic.id;
            this.introduction =  this.sanitizer.bypassSecurityTrustHtml(this.currentClinic.introduction);
        }
        else {
            this.currentClinic = {
                id: null, Data: null, users: [], introduction: "",
            }
        }
        if (localStorage.getItem('currentClinic')) {
            this.currentClinic2 = JSON.parse(localStorage.getItem('currentClinic'));
        }
        if (localStorage.getItem('currentLocation')) {
            this.location_id = JSON.parse(localStorage.getItem('currentLocation')).id
        }
        else {
            this.location_id = 0;
        }

        this.patientCapture = {
            pharmacy_id: null,
            reason: null,
            informed_340b_benefit: 0,
            informed_pharmacy_location: 0,
            alerted_doctor: 0,
            told_freedom_choice: 0,
            patient_phone: 0,
            is_using_340b: 0,
            agree_to_change: 0,
            time_for_step_1: 0,
            time_for_step_2: 0,
            hcf_location_id: this.location_id,
            is_recommend: 0,
            map_viewed: 0,
            benefits_viewed: []
        };



        this.getListClinicLocation();
        if (localStorage.getItem('currentUser')) {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            this.topnav.changeAvatar(this.currentUser.avatarUrl);
        }
        this.getBenefit();

        this.questions = {
            q1: null,
            //yes
            q2: 0,
            q3: null,
            //no
    
            q4: null,
            q5: null,
            //agree?
            q6: null,
            //yes
            q7: 0,
            q8: null,
            q9: null,
            q10: null,
            //no
            q11: 0,
            reason: null,
            text_consent: false
        };
        this.patient_intials =  null;
        router.events.subscribe((val: any) => {
            // console.log(val.urlAfterRedirects)
            if (val.urlAfterRedirects == '/340b;map=true') {
                this.showMap = true;
                this.height = 0;
            } else {
                this.showMap = true;
                this.height = 700;
            }

        });
        this.flagTimeStart = new Date();
        // this.currentTab="submitted"
        // this.selectedPharmacy = true
        this.checkbox2 = false;
        this._tooltip.exportTooltip.subscribe(data => {

            this.handleStep(data)
        })
   
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {

            if (params['closeMap'] === 'true') {
                this.closeMap();
                this.router.navigate(['/', '340b']);
            }
        });
       
        this._userdataServices.userdata.subscribe((val: any) => {

            this.userDataStore = val;
            if (val) {
                this.background = val.backgroundUrl;
            }
        });
        // this.showMap=true;
        $('#startmodal').modal('show');
        this.setNewTime();
        this.today = new Date().toISOString().split('T')[0];
       

    }
    ngAfterViewInit() {
        $('#searchKey').keypress(function (e:any) {
           console.log(e)
        });
    }   
    openModal(){
        $('#startmodal').modal('show');
    }    
    // getpharmacyname(question: any){
    //     for (let i = 0; i < this.allPharmacies.length; i++) {
    //         if(this.allPharmacies[i].id = question)
    //         {
    //             this.selectedpharamcy = this.allPharmacies[i]
    //         }
    //     }

    // } 
    setLocation(location: any) {
        if (location['latitude'] && location['longitude']) {
            this.currentLocation = location;

            this.latitude = this.currentLocation['latitude'];
            this.longitude = this.currentLocation['longitude'];
        }
    }

    clickedMarker(label: string, index: number) {
        // console.log(`clicked the marker: ${label || index}`);
    }

    updateCurrentGeo(event: any) {
        this.latitude = event.lat;
        this.longitude = event.lng;
    }
 
    directionMapMenu() {
        // console.log("this is function.");
        this.direction = true;
        $('.box-view-fullmap').toggleClass('active');
        $('.box-view-fullmap .slide-bar-left').toggleClass('active');
    }

    zoomToPharmacy(pharmacy: any) {
        // this.zoom = 22;
        this.latitude = pharmacy.latitude;
        this.longitude = pharmacy.longitude;
    }

    chooseFromMap(contractedPharmacy: any) {
        if (contractedPharmacy) {
            this.questions.q7 = contractedPharmacy.id;
        }
        this.closeMap();
    }


    changeTypeaheadLoading(e: boolean) {
        this.typeaheadLoading = e;
    }

    changeTypeaheadNoResults(e: boolean) {
        this.typeaheadNoResults = e;
    }

    getAsyncData(context: any) {
        // return this.searchTypeAhead(this.searchString);
    }

    getContractedPharmacies(locationId: any) {


        return this.http_method.callApiHadParram(this.baseUrl + 'pharmacy/getlistpharmacynearbyhcflocation?hcf_location_id=' +
            locationId + '&benefit_id=' + this.filter0 + '&benefit_id1=' + this.filter1 + '&benefit_id2=' + this.filter2 + '&benefit_id3=' + this.filter3 + '&benefit_id4=' + this.filter4 + '&benefit_id5=' + this.filter5 + '&sort=' + this.sortType).subscribe(
                (response: any) => {
                    this.checkAccessdenied(response);
                    this.contractedPharmacies = JSON.parse(response._body).Data;
                    localStorage.setItem('contractedpharmacies', JSON.stringify(this.contractedPharmacies));
                    this.handlingListPharmacy();
                },
                (error: any) => {
                    this.requestErr();
                    this.errorMessage = <any>error;
                    localStorage.clear();
                    this.router.navigate(['/', 'home']);
                });
    }
    answerQuestion(question: any, answer: any) {
        // console.log(this.patientCapture)
        if (question == 1) {
            this.questions.q4 = false;
            if (answer == 'answer-yes') {
                this.patientCapture.is_using_340b = 1;
                if (this.selectedPhar) {
                    this.questions.q2 = this.selectedPhar.id;
                }
                this.flagTimeStart = new Date();
            }
            else {
                this.patientCapture.is_using_340b = 0;
                this.flagTimeStart = new Date();
                this.showNextStepBtn = true;

            }

        }
        if (question == 6) {
            this.questions.q6 = answer;
            if (answer == 'answer-yes') {

            }
            else {
                this.flagTimeStart = new Date();
                this.sendCard = false;
                this.sendPhar = false;
            }
        }
        this.currentTab = answer;
    }

    postEditRequest(body: any) {
        return this.http_method.postApi(this.baseUrl + 'pharmacy_edit_requests', body);
    }
    newSurvey() {
        this.sendCard = false;
        this.sendPhar = false;
        this.currentSurvey = {};
        this.resetQuestions();
        this.currentTab = 'start';
        this.messageSent = false;
        this.surveySending = false;
        this.textSending = false;
        this.setLocation(this.currentLocation);
        this.patientCapture = {
            pharmacy_id: null,
            reason: null,
            informed_340b_benefit: 0,
            informed_pharmacy_location: 0,
            alerted_doctor: 0,
            told_freedom_choice: 0,
            patient_phone: 0,
            is_using_340b: 0,
            agree_to_change: 0,
            time_for_step_1: 0,
            time_for_step_2: 0,
            hcf_location_id: JSON.parse(localStorage.getItem('currentLocation')).id,
            is_recommend: 0,
            map_viewed: 0,
            benefits_viewed: this.listBenefit
        };
        this.setNewTime();
        this.selectedPhar = null;
        $('#pharmacy-city-' + this.collapseIndex).collapse('hide');
        this.showNextStepBtn = false;
        this.checkbox2 = false;
    }


    submitSurvey() {
        this.patientCapture.reason = "0";
        this.textSending = true;
        this.patientCapture.pharmacy_id = this.questions.q2;
        if (this.questions.q4) {
            this.patientCapture.informed_340b_benefit = 1;
        }
        else {
            this.patientCapture.informed_340b_benefit = 0;
        }
        if (this.questions.q5) {
            this.patientCapture.informed_pharmacy_location = 1;
        }
        else {
            this.patientCapture.informed_pharmacy_location = 0;
        }
        if (this.questions.q8) {
            this.patientCapture.alerted_doctor = 1;
        }
        else {
            this.patientCapture.alerted_doctor = 0;
        }
        if (this.questions.q10) {
            this.patientCapture.told_freedom_choice = 1;
            this.patientCapture.agree_to_change = 1;
        } else {
            this.patientCapture.told_freedom_choice = 0;
            this.patientCapture.agree_to_change = 0;
        }
        this.flagPharmacyId = this.patientCapture.pharmacy_id;
        this.patientCapture.time_for_step_1 = this.timeForStep.step1;
        this.patientCapture.time_for_step_2 = this.timeForStep.step2;
        this.http_method.postApi(this.baseUrl + 'patientCapture/CreatePatientCapture', this.patientCapture).subscribe(
            (response: any) => {
                this.textSending = false;
                this.currentTab = 'submitted';
                this.patientEmail = null;
                this.patientEmail = null;
                this.phoneNumber = null;
                this.patientName = null;
                this.typeSend = 'email';
                this.showNextStepBtn = false;
                this.checkAccessdenied(response);
                if (this.sendCard || this.sendPhar) {

                }
                else {
                    $('.profile-box').addClass('add-points');
                    setTimeout(() => {
                        $('.profile-box').removeClass('add-points');
                        if (!this.questions.q7 && this.currentTab == 'submitted') {
                            this.newSurvey();
                        }
                    }, 2000);
                }
                this.getAccountInfo(this.userID);
                this.getClinic(this.clinicID);
            },
            (error: any) => {
                this.requestErr();
            });
    }
    changeExpectedPatients() {

    }

    sendText() {
        this.textSending = true;
        this.errorMessage = null;
        return this.http_method.postApi(this.baseUrl + 'user/sendsms', { phone_number: this.phoneNumber, name: this.patientName, send_discount_card: this.sendCard, include_pharmacy_info: this.sendPhar, pharmacy_id: this.flagPharmacyId }).subscribe(
            (res: any) => {
                this.sendCard = false;
                setTimeout(() => {
                    this.messageSent = true;
                    if (this.currentTab == 'submitted') {
                        this.newSurvey();
                        this.textSending = false;
                    }
                }, 1000);
            },
            (error: any) => {
                this.textSending = false;
                this.errorMessage = "Failed to send the text,please try again!";
                setTimeout(() => {
                    this.messageSent = true;
                    this.errorMessage = null;

                }, 2000);

            });

    }
    sendEmail() {
        this.textSending = true;
        this.errorMessage = null;
        return this.http_method.postApi(this.baseUrl + 'user/discountcard', { email: this.patientEmail, name: this.patientName, send_discount_card: this.sendCard, include_pharmacy_info: this.sendPhar, pharmacy_id: this.flagPharmacyId }).subscribe(
            (res: any) => {
                this.sendCard = false;
                setTimeout(() => {
                    this.messageSent = true;
                    if (this.currentTab == 'submitted') {
                        this.newSurvey();
                        this.textSending = false; 
                    }
                }, 1000);
            },
            (error: any) => {
                this.textSending = false;
                this.errorMessage = "Failed to send the mail,please try again!";
                setTimeout(() => {
                    this.messageSent = true;
                    this.errorMessage = null;

                }, 2000);
            });
    }

    resetQuestions() {
        this.questions = {
            q1: null,
            //yes
            q2: 0,
            q3: null,
            //no
            q4: null,
            q5: null,
            //agree?
            q6: null,
            //yes
            q7: 0,
            q8: null,
            q9: null,
            q10: null,
            //no
            q11: 0,
            reason: null,
            text_consent: false
        };
    }

    closeMap() {
        this.showMap = false;
        this.router.navigate(['/340b']);
    }

    openMap() {
        this.showMap = true;
        this.patientCapture.map_viewed = 1;
        this.router.navigate(['/340b', { map: true }]);
        this.setLocation(this.currentLocation);
    }
    getAccountInfo(id: any) {
        return this.http_method.callApi(this.baseUrl + "users/getuserdetails").subscribe(
            (user: any) => {
                this.currentUser = JSON.parse(user._body);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser.Data));
                this.changeInListUser(this.currentUser.Data);
                this._userdataServices.setCurrentUser(JSON.parse(user._body).Data.id);
            },
            (error: any) => this.requestErr());
    }
    getClinic(id: any) {
        return this.http_method.callApi(this.baseUrl + 'health_care_facilities/gethcfdetails').subscribe(
            (clinic: any) => {
                this.checkAccessdenied(clinic);
                this.currentClinic = JSON.parse(clinic._body);
                localStorage.setItem('currentClinic', JSON.stringify(this.currentClinic.Data));
            },
            (error: any) => this.errorMessage = <any>error);
    }
    choosePhamarcy(id: any, index: any) {
        this.selectedItem = id;
        this.itemStatus = "";
        $(".slide-bar-left").scrollTop(index * 130);
        if (index < 3) {
            this.patientCapture.is_recommend = 1;
        }
        else {
            this.patientCapture.is_recommend = 0;
        }

    }
    makerRadioClick(value: any, clinicId: any) {
        this.selectedItem = clinicId;
        this.itemStatus = value;
    }

    doNextStep(index: any) {
    
        this.showMap = true;
        this.currentTab = 'yes-change';
        // this.router.navigate(['/340b']);
        if (index < 3) {
            this.patientCapture.is_recommend = 1;
        }
        else {
            this.patientCapture.is_recommend = 0;
        }
    }

    getListClinicLocation() {
        return this.http_method.callApi(this.baseUrl + "health_care_facilities/getlisthcflocations").subscribe(
            (res: any) => {
                this.checkAccessdenied(res);
                this.listClinic = JSON.parse(res._body).Data;
                for (var i = 0; i < this.listClinic.length; i++) {
                    this.listClinic[i].latitude = parseFloat(this.listClinic[i].latitude);
                    this.listClinic[i].longitude = parseFloat(this.listClinic[i].longitude);
                }
            },
            (error: any) => this.requestErr());
    }
    setCenterMap(pharmacy: any) {
        this.latitude = pharmacy.latitude;
        this.longitude = pharmacy.longitude;
        $('.box-view-fullmap').removeClass('active');
        $('.box-view-fullmap .slide-bar-left').removeClass('active');
    }
    getAllPharmacy() {
        return this.http_method.callApi(this.baseUrl + "pharmacy/getallpharmacy").subscribe(
            (res: any) => {
                this.checkAccessdenied(res);
                if (JSON.parse(res._body).Status == "access is denied") {
                    localStorage.clear();
                    this.router.navigate(['/', 'home']);
                }
    
                else {
                    this.allPharmacies = JSON.parse(res._body).Data;
                    localStorage.setItem('allPharmacies', JSON.stringify(this.allPharmacies));
                    for (let i = 0; i < this.allPharmacies.length; i++) {
                        this.allPharmacies[i].address = this.allPharmacies[i].name  + ' - ' +  this.allPharmacies[i].address + ', ' + this.allPharmacies[i].zip;
                    }
                }
            },
           
            (error: any) => this.getAllPharmacy());
                 
    }
    
    groupPharmacyByCity() {

        this.groupPhar = JSON.parse(localStorage.getItem('groupPharmacyByCity'))
 
        // console.log(this.groupPhar)
    }

    //search with postcode or address
    getLatLng(value: any) {
        return this.http.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + value).subscribe(
            (res: any) => {
                let location = JSON.parse(res._body).results[0].geometry.location;
                let latitude = location.lat;
                let longtitude = location.lng;
                this.getListPharmacyNearBySearchPlace(latitude, longtitude);
            }
        );
    }

    search(value: any) {
        if (typeof (value) == 'object') {
            if (value) {
                this.getContractedPharmacies(value.id);
                this.currentLocation = value;
                this.handlingLocation();
                this.isClinic = true;
            }
            else {

            }
        }
        else {
            this.getLatLng(value);
            this.isClinic = false;
        }         
    }
    getListPharmacyNearBySearchPlace(lat: any, lng: any) {
        return this.http_method.callApiHadParram(this.baseUrl + "pharmacy/getlistpharmacynearbysearchplace?latitude=" + lat + "&longitude=" + lng  + this.filter0 + '&benefit_id1=' + this.filter1 + '&benefit_id2=' + this.filter2 + '&benefit_id3=' + this.filter3 + '&benefit_id4=' + this.filter4 + '&benefit_id5=' + this.filter5  + "&sort=" + this.sortType).subscribe(
            (res: any) => {
                if (JSON.parse(res._body).Status == "access is denied") {
                    localStorage.clear();
                    this.router.navigate(['/', 'home']);
                }
                else {
                    this.contractedPharmacies = JSON.parse(res._body).Data;
                    this.handlingListPharmacy();
                    this.latitude = lat;
                    this.longitude = lng;
                }
            },
            (error: any) => this.requestErr());
    }
    handlingListPharmacy() {
        if (this.contractedPharmacies.length > 0) {

            for (var i = 0; i < this.contractedPharmacies.length; i++) {
                this.contractedPharmacies[i].latitude = parseFloat(this.contractedPharmacies[i].latitude);
                this.contractedPharmacies[i].longitude = parseFloat(this.contractedPharmacies[i].longitude);
            }
            for (var i = 0; i < this.contractedPharmacies.length; i++) {
                this.contractedPharmacies[i].sync = false;
                this.contractedPharmacies[i].hours24 = false;
                this.contractedPharmacies[i].drivethu = false;
                this.contractedPharmacies[i].delivery = false;
                this.contractedPharmacies[i].Uninsured = false;
                for (var j = 0; j < this.contractedPharmacies[i].benefit.length; j++) {
                    if (this.contractedPharmacies[i].benefit[j][1] == 'Sync') {
                        this.contractedPharmacies[i].sync = true;
                    }
                    else if (this.contractedPharmacies[i].benefit[j][1] == '24 hours') {
                        this.contractedPharmacies[i].hours24 = true;
                    }
                    else if (this.contractedPharmacies[i].benefit[j][1] == 'Drive thru') {
                        this.contractedPharmacies[i].drivethu = true;
                    }
                    else if (this.contractedPharmacies[i].benefit[j][1] == 'Delivery') {
                        this.contractedPharmacies[i].delivery = true;
                    }
                    else if (this.contractedPharmacies[i].benefit[j][1] == 'Self Pay') {
                        this.contractedPharmacies[i].Uninsured = true;
                    }
                }
            }
            this.latitude = this.contractedPharmacies[0].latitude;
            this.longitude = this.contractedPharmacies[0].longitude;
        }
    }
    handlingLocation() {
        this.currentLocation.latitude = parseFloat(this.currentLocation.latitude);
        this.currentLocation.longitude = parseFloat(this.currentLocation.longitude);
    }
    sort() {
        if (this.isClinic) {
            if (this.selectedAdress) {
                this.getContractedPharmacies(this.selectedAdress.id);
            }
            else {
                this.getContractedPharmacies(this.currentLocation.id);
            }

        }
        else {
            this.getListPharmacyNearBySearchPlace(this.latitude, this.longitude);
        }
    }
    Refresh() {
        if (this.currentTab == 'answer-no') {
            this.questions.q4 = false;
            this.questions.q5 = false;
        }
        if (this.currentTab == 'yes-change') {
            this.questions.q8 = false;
            this.questions.q9 = false;
            this.questions.q10 = false;
        }
        if (this.currentTab == 'answer-yes') {
            this.questions.q4 = false;
        }
    }



    getBenefit() {
        return this.http_method.callApi(this.baseUrl + "benefit/listbenefit").subscribe(
            (res: any) => {
                this.checkAccessdenied(res);
                this.listBenefit = JSON.parse(res._body).Data;
                localStorage.setItem('listBenefit', JSON.stringify(this.listBenefit));
                this.patientCapture.benefits_viewed = this.listBenefit;
                for (let i = 0; i < this.listBenefit.length; i++) {
                    this.listBenefit[i].viewed = 0;
                }
            },
            (error: any) => this.getBenefit());
    }
    changeFilter(idFilter: any) {
        if (idFilter == 0){
            if( !this.filterall){
                this.filterall = true; 
                this.filter0 = 0;
                this.filterhours = false;
                this.filterdrive = false;  
                this.filterdelivery = false;  
                this.filtersync = false;  
                this.filterself = false;  
                this.filter1 = 0;
                this.filter2 = 0;
                this.filter3 = 0;
                this.filter4 = 0;
                this.filter5 = 0;
           
            }
            else{
                this.filterall = false;
                this.filter0 = 1;
                
            }
        }
        if (!this.filterall && !this.filterhours && !this.filterdrive && !this.filterdelivery && !this.filtersync && !this.filterself){

                this.filterall = true;
                this.filter0 = 0;

        }

        if (idFilter == 1){
            if( !this.filterhours){
                this.filterhours = true;
                this.filter1 = 1;
                this.filterall = false;
                this.filter0 = 1;
            }
            else{
                this.filterhours = false;
                this.filter1 = 0;
                
            }
        }
        if (idFilter == 2){
            if( !this.filterdrive ){
                this.filterdrive = true;
                this.filter2 = 2;
                this.filterall = false;
                this.filter0 = 1;
            }
            else{
                this.filterdrive = false;
                this.filter2 = 0;
            }
        }
        if (idFilter == 3){
            if( !this.filterdelivery ){
                this.filterdelivery = true;
                this.filter3 = 3;
                this.filterall = false;
                this.filter0 = 1;
            }
            else{
                this.filterdelivery = false;
                this.filter3 = 0;
            }
        }
        if (idFilter == 4){
            if( !this.filtersync ){
                this.filtersync = true;
                this.filter4 = 4;
                this.filterall = false;
                this.filter0 = 1;
            }
            else{
                this.filtersync = false;
                this.filter4 = 0;
            }
        }
        if (idFilter == 5){
            if( !this.filterself ){
                this.filterself = true;
                this.filter5 = 5;
                this.filterall = false;
                this.filter0 = 1;
            }
            else{
                this.filterself = false;
                this.filter5 = 0;
            }
        }
        
        // this.currentFilter = idFilter;
        if (this.isClinic) {
            if (this.selectedAdress) {
                this.getContractedPharmacies(this.selectedAdress.id);
            }
            else {
                this.getContractedPharmacies(this.currentLocation.id);
            }
        }
        else {
            this.getListPharmacyNearBySearchPlace(this.latitude, this.longitude);
        }
        for (let i = 0; i < this.patientCapture.benefits_viewed.length; i++) {
            if (this.patientCapture.benefits_viewed[i].id == idFilter) {
                this.patientCapture.benefits_viewed[i].viewed = 1;
            }
        }
    }
    choosePhar(pharId: any) {

        this.choosed = pharId;
        let numberId = parseInt(pharId);
        this.questions.q2 = numberId;
        for (var i = 0; i < this.allPharmacies.length; i++) {
            if (this.allPharmacies[i].id == numberId) {
                this.selectedPhar = this.allPharmacies[i];
                break;
            }
        };
        this.answerQuestion(1, 'answer-yes');
    }
    choosePharSearch() {
        this.choosed = String(this.selectedPhar.id);
        for (let i = 0; i < this.groupPhar.length; i++) {
            if (this.selectedPhar.city == this.groupPhar[i].city) {
                $('#pharmacy-city-' + this.collapseIndex).collapse('hide')
                this.collapseIndex = i;
                $('#pharmacy-city-' + i).collapse('show')
                break;
            }
        }

    }
    changeInListUser(user: any) {

        let listUser = JSON.parse(localStorage.getItem('listUser'));
        for (let i = 0; i < listUser.length; i++) {
            if (listUser[i].id == user.id) {
                listUser[i] = user
            }
        }
        localStorage.setItem('listUser', JSON.stringify(listUser));
        // console.log(listUser);
    }
    changeShowMap() {
        // console.log('aaaa');
        if (this.showMap) {
            this.showMap = false;
        }
    }
    checkAccessdenied(res: any) {
        if (JSON.parse(res._body).Status == "access is denied") {
            localStorage.clear();
            this.router.navigate(['/', 'home']);
        }
    }
    requestErr() {
        localStorage.clear();
        this.router.navigate(['/', 'home']);
    }
    toEmail() {
        this.typeSend = 'email'
    }
    toSMS() {
        this.typeSend = 'sms'
    }
    setNewTime() {
        this.timeForStep.step1 = 0;
        this.timeForStep.step2 = 0;
    }
    setTimeStep(step: any) {
        if (step == 1) {
            this.flagTimeEnd = new Date();
            this.timeForStep.step1 = ((this.flagTimeEnd - this.flagTimeStart) % 60000) / 1000;
            this.flagTimeStart = new Date();
        }
        if (step == 2) { 
            this.flagTimeEnd = new Date();
            this.timeForStep.step2 = ((this.flagTimeEnd - this.flagTimeStart) % 60000) / 1000;
            this.flagTimeStart = new Date();
        }
    }
    submitSurveyNoChange() {
        this.flagTimeEnd = new Date();
        this.timeForStep.step2 = ((this.flagTimeEnd - this.flagTimeStart) % 60000) / 1000;
        this.flagTimeStart = new Date();
        this.patientCapture.time_for_step_1 = this.timeForStep.step1;
        this.patientCapture.time_for_step_2 = this.timeForStep.step2;
        if (this.questions.q4) {
            this.patientCapture.informed_340b_benefit = 1;
        }
        else {
            this.patientCapture.informed_340b_benefit = 0;
        }
        if (this.questions.q5) {
            this.patientCapture.informed_pharmacy_location = 1;
        }
        else {
            this.patientCapture.informed_pharmacy_location = 0;
        }
        this.patientCapture.pharmacy_id = 0;
        this.patientCapture.reason = this.questions.q11;
        this.http_method.postApi(this.baseUrl + 'patientCapture/CreatePatientCapture', this.patientCapture).subscribe(
            (response: any) => {
                this.checkAccessdenied(response);
                this.getAccountInfo(this.userID);
                this.getClinic(this.clinicID);
                this.currentTab = 'submitted';
                $('.profile-box').addClass('add-points');
                setTimeout(() => {
                    if (!this.questions.q7 && this.currentTab == 'submitted') {
                        $('.profile-box').removeClass('add-points');
                        this.currentTab = 'start';
                    }
                }, 2000);

            },
            (error: any) => {
                this.requestErr();
            });
    }

    handleStep(data: any) {

        this.pageView = data.page;
        this.stepView = data.active;
        if (this.pageView == '340b') {
            if (this.stepView < 4) {
                this.currentTab = 'start';
            }
            if (this.stepView >= 4 && this.stepView <= 6) {
                this.currentTab = 'answer-yes';
            }
            if (this.stepView == 9 || this.stepView == 8) {
                this.currentTab = 'answer-no';
            }
        }

        if (this.pageView == 'back-to-script' && this.stepView == 0) {
            this.currentTab = "no-change";
        }
        if (this.pageView == 'back-to-script' && (this.stepView == 1 || this.stepView == 2)) {
            this.currentTab = "yes-change";
        }
        if (this.pageView == 'card') {
            this.currentTab = "submitted";
            this.sendCard = true;
        }
    }
    test() {
        this.router.navigate(['/dashboard/home/my-achievements']);
    }
    onEnter(event:any){
        if(event == 13){
            this.search(this.selectedAdress)
        }
    }
}
       