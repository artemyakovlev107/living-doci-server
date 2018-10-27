import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';

import { Observable } from 'rxjs';
import { UserDataService } from "../../shared/services/userdata.services";

@Component({
    moduleId: module.id,

    selector: "home-cmp",
    templateUrl: 'home.component.html',
    providers: [HomeComponent]
})

export class HomeComponent implements OnInit {

    currentUser: Object;
    userDataStore: {
        backgroundUrl: any
    };
    constructor(private _userdataServices: UserDataService) {

        if (localStorage.getItem('currentUser')) {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        }
    }

    ngOnInit() {
        this._userdataServices.userdata.subscribe((val: any) => {
            this.userDataStore = val;

        });

    }

}
