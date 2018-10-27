import {Injectable, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import 'rxjs/add/operator/map';
@Injectable()
export class ListUserService implements OnInit {
	listUser: Observable<Object>
	private _listUser: BehaviorSubject<Array<Object>>;
    private dataStore:{
        listUser :Object
    };
    private listUserSaved:Array<Object>;
	ngOnInit() {
	        //console.log('init');

	    }
	    constructor() {
	    	this.listUserSaved = JSON.parse(localStorage.getItem('listUser'));
	    	this._listUser = <BehaviorSubject<Array<Object>>> new BehaviorSubject(this.listUserSaved);
	    }
}