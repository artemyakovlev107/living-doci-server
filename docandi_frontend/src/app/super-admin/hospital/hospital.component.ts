declare var $ : any;
import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {HttpMethod} from "../../shared/services/http.method";
import { MapsAPILoader } from '@agm/core';
@Component({
    moduleId: module.id,
    selector: 'hospital',
    templateUrl: 'hospital.component.html',
    providers: [ HttpMethod]

})
export class HospitalComponent {
    http_method:any;
    baseUrl:string;
    listClient:Array<any>;
    public filterQuery = "";
    rowsOnPage:number = 10;
    editItem:{
        image_url:string,
        full_name:string,
        name:string,
        email:string
    };
    deleteClientName:string;
    itemChoosed:{id:number};
    // info Add
    userInfo:{
        full_name:string,
        address:string,
        city:string,
        state:string,
        zip:string,
        phone:string,
        email:string,
        password:string,
        passwordConfirm:string,
        hospital_name:string
    };
    oldUrl:string=null;
    Image:any;
    errorMessage:string;
    constructor(private router:Router,http_method: HttpMethod) {
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.getListHospital();
        this.editItem={
            image_url:'',
            full_name:'',
            name:'',
            email:''
        }
        this.itemChoosed={id:0};
        this.newInfo()
    }
    newInfo(){
        this.userInfo={
            full_name:null,
                address:null,
                city:null,
                state:null,
            zip:null,
                phone:null,
            email:null,
                password:null,
                passwordConfirm:null,
            hospital_name:null
        };
        let src ='http://norsktilhengerutleie.info/wp-content/uploads/2010/09/your-logo-here-aalesund1.png';
        $('#image').attr('src', src);
        this.getListHospital();
        this.Image = null;
    }
    getListHospital(){
        return this.http_method.callApiNoToken(this.baseUrl+"health_care_facilities/getlisthcf").subscribe(
            (res:any) => {
                this.checkAccessdenied(res);
                this.checkSizePage();
                    this.listClient = JSON.parse(res._body).Data;
            },
            (error:any) => this.getListHospital());
    }
    selectPage(){
        this.checkSizePage();
    }
    editModal(item:any){
        this.editItem =  item;
        $('#ModalEdit').modal({backdrop: 'static',show:true});
        this.oldUrl = item.image_url;
    }
    confirmDeleteModal(item:any){
        this.itemChoosed = item;
        this.deleteClientName =  item.name;
        $('#DeleteConfirmModal').modal('show');
    }
    gotoDetail(id:any){
        this.router.navigate(['/admin/manager/clinic',id]);
    }
    deleteHospital(){
        return this.http_method.callApiNoToken(this.baseUrl+"health_care_facilities/deletehcf?hcfId="+this.itemChoosed.id).subscribe(
            (res:any) => {
                $('#DeleteConfirmModal').modal('hide');
                this.getListHospital();
            },
            (error:any) => {});
    }
    editHcf(){
        return this.http_method.postApi(this.baseUrl+"health_care_facilities/updatehcf",this.editItem).subscribe(
            (res:any) => {
                $('#ModalEdit').modal('hide');
                this.getListHospital();
            },
            (error:any) => {});
    }
    modalAdd(){
        $('#ModalAdd').modal({backdrop: 'static',show:true});
    }
    chooseImage(){
        $('#file').click()

    }
    changeImage(event:any){
        this.Image = event.srcElement.files;
        this.readFile(event.target.files[0]);
        var reader = new FileReader();
        reader.onload = function(e:any) {
            let src = e.target.result;
            $('#image').attr('src', src);
        };
        reader.readAsDataURL(event.target.files[0]);
    }
    chooseImageEdit(){
        $('#fileEdit').click()

    }
    changeImageEdit(event:any){
        this.Image = event.srcElement.files;
        this.readFile(event.target.files[0]);
        var reader = new FileReader();
        reader.onload = function(e:any) {
            let src = e.target.result;
            $('#imageEdit').attr('src', src);
        };
        reader.readAsDataURL(event.target.files[0]);
    }
    readFile(file:any){

        // var reader = new FileReader();
        // let Url = reader.readAsDataURL(file);

    }
    addNewClient() {
        return this.http_method.postApiFile(this.baseUrl + "health_care_facilities/addhcf", this.userInfo, this.Image).subscribe(
            (response:any)=> {
                let res = JSON.parse(response._body);
                if (res.Status == 'success') {
                    $('#ModalAdd').modal('hide');
                    this.newInfo();
                   
                }
                else {
                    this.errorMessage = res.Message;
                    setTimeout(() => {
                        this.errorMessage = '';
                    }, 2000);
                }

            },
            (error:any)=> {

            }
        );
    }
    updateClient(){
        if(this.Image){
            this.http_method.postApiFile(this.baseUrl + 'health_care_facilities/updatehcf',this.editItem,this.Image).subscribe(
                (response:any) => {
                    this.checkAccessdenied(response);
                    $('#ModalEdit').modal('hide');
                    this.newInfo();
                },
                (error:any) => {
                    this.errorMessage = error;
                    this.errorMessage = 'update Fail';
                });
        }
        else{
            this.http_method.postApiNoToken(this.baseUrl + 'health_care_facilities/updatehcf',this.editItem).subscribe(
                (response:any) => {
                    this.checkAccessdenied(response);
                    $('#ModalEdit').modal('hide');
                    this.newInfo();
                },
                (error:any) => {
                    this.errorMessage = error;
                    this.errorMessage = 'update Fail';
                });
        }
    }
    closeModalAdd(){
        this.newInfo();
        let src = this.oldUrl;
        $('#imageEdit').attr('src', src);
    }
    checkAccessdenied(res:any){
        if(JSON.parse(res._body).Status=="access is denied"){
            sessionStorage.clear();
            this.router.navigate(['/admin/', 'login']);
        }
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
