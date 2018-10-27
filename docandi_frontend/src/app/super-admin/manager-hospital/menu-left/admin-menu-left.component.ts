declare var $ : any;
import {Component,OnInit} from '@angular/core';
import {Router,ActivatedRoute} from '@angular/router';
import {HttpMethod} from "../../../shared/services/http.method";
@Component({
    moduleId: module.id,
    selector: 'admin-menu-left',
    templateUrl: 'admin-menu-left.component.html',
    providers: [ HttpMethod]

})
export class AdminMenuLeftComponent implements OnInit {
    currentPage:string;
    urlSplit:any;
    currentId:string
    constructor(private router:Router,http_method: HttpMethod,private route: ActivatedRoute){
        this.currentPage='clinic'
        router.events.subscribe((val:any) => {
            this.urlSplit=val.url.split('/');
            this.currentPage = this.urlSplit[this.urlSplit.length-2];;
            this.currentId=this.urlSplit[this.urlSplit.length-1];
        })
    }
    ngOnInit() {

    }
    gotoManagerClinic(){
        this.router.navigate(['/admin/manager/clinic',this.currentId]);
        this.currentPage='clinic';
    }
    gotoManagerPharmacy(){
        this.router.navigate(['/admin/manager/pharmacy',this.currentId]);
        this.currentPage='pharmacy';
    }
    gotoManagerMember(){
        this.router.navigate(['/admin/manager/member',this.currentId]);
        this.currentPage='member';
    }

}
