import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    moduleId: module.id,
    selector: 'home-menu-left',
    templateUrl: 'menu-left.html',
})

export class HomeMenuLeftComponent {

    page:string;
    urlSplit:Array<any>=[];
    constructor(private router: Router) {
         this.urlSplit=window.location.href.split('/');
         this.page=this.urlSplit[this.urlSplit.length-1];
         // console.log(this.page)
    }


    gotoMyAchievements() {
        this.page = "my-achievements"
        this.router.navigate(['/dashboard/home', 'my-achievements']);
    }

    gotoOverViewHomePage() {
        this.page = "overview"
        this.router.navigate(['/dashboard/home', 'overview']);
    }
    gotoSetting(){
        
        this.page = "account-settings";
        this.router.navigate(['/dashboard/home', 'account-settings']);
    }
    gotoProgressReport(){
        this.page = "progress-report";
        this.router.navigate(['/dashboard/home', 'progress-report']);
    }
}
