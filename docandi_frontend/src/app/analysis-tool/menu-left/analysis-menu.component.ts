import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';
// import tildify = require("tildify");
declare var $ : any;

@Component({
    moduleId: module.id,
    selector: 'analysis-menu',
    templateUrl: 'analysis-menu.component.html'
})
@Injectable()
export class AnalysisMenuComponent implements OnInit {
    currentPage:string;
    urlSplit:Array<any>=[];
    constructor() {
        this.currentPage = "MA";

    }
    ngOnInit() {
        this.urlSplit=window.location.href.split('/');
        let page=this.urlSplit[this.urlSplit.length-1];
        this.currentPage = page;
        // this.setSizeMenu();
    }
    gotoMA(){
        // this.setSizeMenu();
        this.currentPage = "MA";
    }
    gotoMetric(){
        // this.setSizeMenu();
        this.currentPage = "Three40BMetric";
    }
    gotoSoftwareUsage(){
        // this.setSizeMenu();
        this.currentPage = "Software-Usage";
    }
    // setSizeMenu(){
    //     if($(window).width()>983) {
    //         setTimeout(() => {
    //             let height = $('.dashboard_col_right').height();
    //             $('.dashboard_col_left').css('min-height', height);
    //         }, 1000);
    //     }
    // }
    checkSizePage(){
        // console.log($('.dashboard_col_right').height());
        if($(window).width()>983) {
            setTimeout(() => {
                let height = $('.dashboard_col_right').height();
                $('.dashboard_col_left').css('min-height', height);
                $('.dashboard_col_left').css('max-height', height);
            }, 200);
        }
        else {
            $('.dashboard_col_left').css('min-height',0);
        }
    }
    getWidthChartParentSU(){
        return $('.software-usage-capture-chart').width();
    }
    getWidthChartParentSUTime(){
        return $('.software-usage-chart-time-of-use').width();
    }
    getWidthChartMedicationSaving(){
        return $('#chartMedicationSavings').width();
    }
    getWidthChart340BReason(){
        return $('.admin-metrics-340b-chart-box-2').width();
    }

}
