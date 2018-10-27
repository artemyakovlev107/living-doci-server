/**
 * Created by Admin on 1/13/2017.
 */
import {Injectable, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import 'rxjs/add/operator/map';
@Injectable()
export class MenuService implements OnInit {
    menuData: Observable<Object>
    private _menuData: BehaviorSubject<Object>;
    private menuDataStore:{
        currentMenu: string,
        showMap340B: boolean,
    };
    constructor() {
        this.menuDataStore = {
            currentMenu:null,
            showMap340B:false
        }
    }
    ngOnInit() {

    }
    changeMenu(menu:string){
        this.menuDataStore.currentMenu = menu;
    }
    show_hideMap(status:boolean){
        this.menuDataStore.showMap340B = status;
    }
}