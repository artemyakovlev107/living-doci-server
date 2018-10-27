declare var $ : any;
import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {HttpMethod} from "../../shared/services/http.method";

@Component({
    selector:'faq',
    templateUrl:'faq.component.html'
})

export class FAQComponent {
    baseUrl: string;
    id: number;
    errorMessage:string = null;
    listFAQ : Array<Object>;
    oldListFAQ: Array<Object>;
    typeModal: string;
    indexDelete:number;
    faq: {
        id: number,
        question: string,
        answer: string
    };
    constructor(private http_method:HttpMethod, private router:Router) {
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.listFAQ = [];
        this.faq = {
            id: null,
            question: null,
            answer: null
        }
    }
    ngOnInit() {
        this.getListFAQ();
    }

    showModalAddEdit(type:any,faq:any){
        this.oldListFAQ = this.listFAQ;

        if(type=='Add'){
            this.faq={
                id: null,
                question:null,
                answer:null
            }
        }
        else{
            this.faq = faq;
        }
        this.typeModal = type;
        $('#AddEditModal').modal({backdrop: 'static',show:true});

    }
    hideModal(){
        this.getListFAQ();
        $('#AddEditModal').modal('hide');
    }
    addFAQ(){
        return this.http_method.postApi(this.baseUrl+"faq/add",this.faq).subscribe(
            (res:any) => {
                this.checkAccessdenied(res);
                this.getListFAQ();
                $('#AddEditModal').modal('hide');
            },(error:any) => this.errorMessage = <any>error
        );
    }
    updateFAQ() {
        return this.http_method.postApi(this.baseUrl+"faq/update",this.faq).subscribe(
            (res:any) => {
                this.checkAccessdenied(res);
                $('#AddEditModal').modal('hide');
                this.getListFAQ();
            },(error:any) => this.errorMessage = <any>error
        );
    }
    getListFAQ() {
        return this.http_method.callApiNoToken(this.baseUrl+"faq/list").subscribe(
            (res:any) => {
                this.checkAccessdenied(res);
                this.listFAQ = JSON.parse(res._body).Data;
            },(error:any) => this.errorMessage = <any>error);
    }
    checkAccessdenied(res:any){
        if(JSON.parse(res._body).Status=="access is denied"){
            sessionStorage.clear();
            this.router.navigate(['/admin/', 'login']);
        }
    }

    confirmDeleteFAQ(faq: any) {
        this.faq = faq;
        $('#confirmDelete').modal('show');
    }

    deleteFAQ() {
        return this.http_method.callApiNoToken(this.baseUrl+"faq/delete?id="+this.faq.id).subscribe(
            (res:any) => {
                this.checkAccessdenied(res);
                this.listFAQ.splice(this.indexDelete,1);
                this.getListFAQ();
                $('#confirmDelete').modal('hide');
            },(error:any) => this.errorMessage = <any>error
        );
    }
}