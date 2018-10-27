
import {Injectable, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import 'rxjs/add/operator/map';
import {UserData} from "./userdata.interface";


@Injectable()
export class UserDataService implements OnInit {
    userdata: Observable<Object>
    private _userdata: BehaviorSubject<Object>;

    loggedInUsers: Observable<Object[]>;
    private _loggedInUsers: BehaviorSubject<Object[]>;

    private dataStore:{
        userData: {
            avatarUrl: string,
            backgroundUrl: string,
            showmap: boolean
        }, // current logged in userdata
        loggedInUserList: Object[]
    };


    private currentUser: {
    avatarUrl: string,
    backgroundUrl: string,
    showmap: boolean
};
    private listUser:any;
    http_method:any;
    baseUrl:string;
    ngOnInit() {
        //console.log('init');

    }

    private _userDataType:UserData;

    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.listUser = JSON.parse(localStorage.getItem('listUser'));
        this._userdata = <BehaviorSubject<Object>> new BehaviorSubject(this.currentUser);
        this.userdata = this._userdata.asObservable();
        if(this.listUser == null){
            this.listUser = [];
        }
        this._loggedInUsers = <BehaviorSubject<Object[]>>new BehaviorSubject(this.listUser);
        this.loggedInUsers = this._loggedInUsers.asObservable();
        this.dataStore = {
            userData: this.currentUser,
            loggedInUserList: this.listUser
        }
    }
    updateAvatar(avatarurl: string) {
            this.dataStore.userData.avatarUrl = avatarurl;
            this._userdata.next(Object.assign({}, this.dataStore).userData);
    }
    updateBackground(backgroundUrl:any){
        this.dataStore.userData.backgroundUrl = backgroundUrl;
        this._userdata.next(Object.assign({}, this.dataStore).userData);
    }
    showHideMap(mapStatus:any){
        this.dataStore.userData.showmap=mapStatus;
        this._userdata.next(Object.assign({}, this.dataStore).userData);
    }

    ///Get current logged in user
    getUserData() {
        this._userdata.next(Object.assign({}, this.dataStore).userData);
    }

    // get data from Local Storage
    updateFromLocalStorage(){

        this.dataStore.userData = JSON.parse(localStorage.getItem('currentUser'));
        this.dataStore.loggedInUserList = JSON.parse(localStorage.getItem('listUser'));
        this._userdata.next(Object.assign({}, this.dataStore).userData);
        this._loggedInUsers.next(Object.assign({}, this.dataStore).loggedInUserList);
    }

    // Set current User
    setCurrentUser(userId: number){
        this.updateFromLocalStorage();
        this.dataStore.loggedInUserList.forEach((item:any, index:any) => {
            if (item.id === userId) {
                this.dataStore.userData = item;
                localStorage.setItem('currentUser', JSON.stringify(item));
                
            }
        });
        this._userdata.next(Object.assign({}, this.dataStore).userData);

    }

 

}