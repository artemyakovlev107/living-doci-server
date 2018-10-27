
declare var $ : any;
import { Component } from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';

import {FormsModule} from "@angular/forms";
import {Router} from '@angular/router';
import { HttpMethod } from "../shared/services/http.method";
import 'rxjs/Rx';
/**
 * This class represents the lazy loaded LoginComponent.
 */
@Component({
    moduleId: module.id,

    selector: 'sign-up-cmp',
    templateUrl: 'sign-up.component.html',
     providers: [ HttpMethod]
})
export class SignUpComponent {
    baseUrl :string;
     http_method:any;
    response :any;
    errorMessage:any;
    userName:any;
    errorConfirm:boolean;
    full_name:string;
    address:string;
    emailAdress:string;
    city:string;
    hospitalName:string;
    password:string;
    passwordConfirm:string;
    currentImageUrl:string;
    Image:any=null;
    userInfo:{
        full_name:string,
        address:string,
        city:string,
        hospital_name:string,
        email:string,
        password:string,
        state:string,
        zip:number,
        phone:string
    };
    clinicLocation:{
        address:string,
        city:string,
        email:string,
        id:string,
        latitude:number,
        longitude:number,
        name:string,
        phone:string,
        state:string,
        zip:string,
    };
    state:string;
    zipcode:number;
    phone:string;
    ImageChoosed:boolean=false;
    constructor(http_method: HttpMethod, private router:Router) {

        this.errorConfirm = false;
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        //this.userInfo= {};
        this.clinicLocation={
            address:null,
            city:null,
            email:null,
            id:null,
            latitude:null,
            longitude:null,
            name:null,
            phone:null,
            state:null,
            zip:null
        }
    }

    signUp(){

        this.userInfo = {
            full_name:this.full_name,
            address:this.address,
            city:this.city,
            hospital_name:this.hospitalName,
            email:this.emailAdress,            
            password:this.password,
            state:this.state,
            zip:this.zipcode,
            phone:this.phone
        }
        if(this.password!=this.passwordConfirm){
            this.errorConfirm = true;
        }
        else{
            // console.log(this.userInfo);
            return this.http_method.postApiFile(this.baseUrl+"health_care_facilities/addhcf",this.userInfo,this.Image).subscribe(
                (response:any)=>{
                    let res = JSON.parse(response._body);
                    if(res.Status =='success') {
                        $('#Addlocation').modal({backdrop: 'static',show:true});
                    }
                    else {
                        this.errorMessage = res.Message;
                        setTimeout(() => {
                            this.errorMessage = '';
                        }, 2000);
                    }

                    },
                (error:any)=>{

                    }
                );
        }
    }
    typeConfirm(){
        this.errorConfirm = false;
    }
    changeImage(event:any){
        // console.log(event.srcElement.files[0]);

        this.Image = event.srcElement.files;
        this.readFile(event.target.files[0]);
        var reader = new FileReader();

        reader.onload = function(e:any) {
            let src = e.target.result;
            $('#image').attr('src', src);
        };

        reader.readAsDataURL(event.target.files[0]);

    }
    readFile(file:any){

        // var reader = new FileReader();
        // let Url = reader.readAsDataURL(file);

    }
    chooseImage(){
        $('#file').click()
    }
    chooseImageClinic(){
        $('#fileClinic').click()

    }
    getLatLngForAdd(value:any){
        return this.http_method.callApiNotAuth("https://maps.googleapis.com/maps/api/geocode/json?address="+value).subscribe(
            (res:any) => {
                let Res = JSON.parse(res._body);
                if(Res.status != 'ZERO_RESULTS'){
                    let location= Res.results[0].geometry.location;
                    this.clinicLocation.latitude = location.lat;
                    this.clinicLocation.longitude = location.lng;
                    this.addLocation();
                }
                else{
                    alert("This isn’t a valid address. Please check and retype the address again.");
                }
            },
            (error:any) => {
                // console.log(error)
            });

    }
    addLocation(){
        return this.http_method.postApiFile(this.baseUrl+"health_care_facilities/addhcflocations",this.clinicLocation,this.Image).subscribe(
            (res:any) => {
                let Res = JSON.parse(res._body);
                if(Res.status != 'success') {
                    $('#Addlocation').modal('hide');
                    this.router.navigate(['/', 'login',{email:this.userInfo.email}]);
                }
                else {
                    this.errorMessage = res.Message;
                    setTimeout(() => {
                        this.errorMessage = '';
                    }, 2000);
                }
            },
            (error:any) => this.errorMessage = <any>error);

    }
    changeImageClinic(event:any){
        this.ImageChoosed = true;
        this.Image = event.srcElement.files;
        this.readFile(event.target.files[0]);
        var reader = new FileReader();
        reader.onload = function(e:any) {
            let src = e.target.result;
            $('#imageClinic').attr('src', src);
        };

        reader.readAsDataURL(event.target.files[0]);
    }
    

}
