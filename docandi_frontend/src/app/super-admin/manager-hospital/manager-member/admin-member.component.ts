declare var $ : any;
import {Component} from '@angular/core';
import {Router,ActivatedRoute} from '@angular/router';
import {HttpMethod} from "../../../shared/services/http.method";
@Component({
    moduleId: module.id,
    selector: 'admin-member',
    templateUrl: 'admin-member.component.html',
    providers: [ HttpMethod]

})
export class AdminMemberComponent {
    baseUrl:string;
    http:any;
    http_method:any;
    router:any
    allPharmacies:any;
    rowsOnPage:number=10;
    hcfId:any;
    sub:any;
    token:number;
    memberChoosed:{
        id:any,
        full_name:string,
        email:string
    };
    member:{
        full_name:any,
        role:any,
        email:any,
        hcf_id:any
    };
    err:string;
    typeModal:any;
    listMember:Array<Object>;
    constructor(http_method: HttpMethod,router:Router,private route: ActivatedRoute){
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.sub = this.route.params.subscribe(params => {
            this.hcfId = +params['id']; // (+) converts string 'id' to a number
            // console.log(this.hcfId);
        });
        this.member={
                full_name:null,
                role:null,
                email:null,
                hcf_id:this.hcfId
        }
        this.memberChoosed={
            id:null,
                full_name:null,
                email:null
        };
        this.getAllMember();
        this.token = 0;
    }
    getAllMember(){
        return this.http_method.callApiNoToken(this.baseUrl+"health_care_facilities/alluser?hcfId="+this.hcfId).subscribe(
            (res:any) => {
                if(JSON.parse(res._body).Status=="access is denied"){
                    sessionStorage.clear();
                    this.router.navigate(['/', 'login']);
                }
                else{
                    this.listMember = JSON.parse(res._body).Data;
                    this.checkSizePage();
                }
            },
            (error:any) => this.getAllMember());
    }
    confirmDelete(member:any){
        this.memberChoosed = member;
        $('#confirmDelete').modal('show');
    }
    selectPage(){
        this.checkSizePage();
    }
    modalMember(type:any,member:any){
        if (type == 'Add') {
            this.member={
                full_name:null,
                role:0,
                email:null,
                hcf_id:this.hcfId
            }
        }
        else
        {
            this.member = member;
        }
        this.typeModal = type;
        $('#AddEditModal').modal({backdrop: 'static', show: true});
    }
    hideModal(){
        this.getAllMember();
        $('#AddEditModal').modal('hide');
    }
    inviteMember(){
        return this.http_method.postApiNoToken(this.baseUrl+"user/inviteuser",this.member).subscribe(
            (res:any) => {
                let Res = JSON.parse(res._body);
                if(Res.Status=="error"){
                    this.err = Res.Message;
                    setTimeout(() => {
                        this.err = null;
                    }, 2000);
                }
                else{
                    $('#AddEditModal').modal('hide');
                    this.getAllMember();
                }
            },
            (error:any) => {
                this.err = error;
                setTimeout(() => {
                    this.err = null;
                }, 2000);
            });
    }
    deleteMember(){
        return this.http_method.callApiNoToken(this.baseUrl+"user/removemember?userId="+this.memberChoosed.id).subscribe(
            (res:any) => {
                this.checkAccessdenied(res);
                this.getAllMember();
                $('#confirmDelete').modal('hide');
            },
            (error:any) => {alert('Delete member fail')});

    }
    checkAccessdenied(res:any){
        if(JSON.parse(res._body).Status=="access is denied"){
            sessionStorage.clear();
            this.router.navigate(['/admin/', 'login']);
        }
    }
    UpdateMember(){
        return this.http_method.postApiNoToken(this.baseUrl+"user/updateinfo",this.member).subscribe(
            (res:any) => {
                let Res = JSON.parse(res._body);
                if(Res.Status=="error"){
                    this.err = Res.Message;
                    setTimeout(() => {
                        this.err = null;
                    }, 2000);
                }
                else{
                    $('#AddEditModal').modal('hide');
                    this.getAllMember();
                }
            },
            (error:any) => {
                this.err = error;
                setTimeout(() => {
                    this.err = null;
                }, 2000);
            });
    }
    modalGiveToken(item:any){
        this.memberChoosed = item;
        $('#modalGiveToken').modal('show');
    }
    giveToken(){
        return this.http_method.postApiNoToken(this.baseUrl+"user/rewardtoken",{user_id:this.memberChoosed.id,token:this.token}).subscribe(
            (res:any) => {
                $('#modalGiveToken').modal('hide');
                this.getAllMember();
            },
            (error:any) => {
                this.err = error;
                setTimeout(() => {
                    this.err = null;
                }, 2000);
            });
    }
    checkSizePage(){
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
}
