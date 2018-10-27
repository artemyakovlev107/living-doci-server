declare var $ : any;
import {Component,OnInit} from '@angular/core';
import {Router,ActivatedRoute} from '@angular/router';
import {HttpMethod} from "../../../shared/services/http.method";
@Component({
    moduleId: module.id,
    selector: 'admin-clinic',
    templateUrl: 'admin-clinic.component.html',
    providers: [ HttpMethod]

})
export class AdminClinicComponent implements OnInit{
    listClinicLocation:Array<Object>;
    oldListClinic:Array<Object>;
    errorMessage:string = null;
    http_method: any;
    baseUrl:string;
    listClinic:Array<any>;
    id:number;
    editLocationItem:{
        address:string,
        city:string,
        state:string,
    }
    Image:any;
    typeModal:string;
    oldUrl:string=null;
    indexDelete:number;
    rowsOnPage:number = 10;
    editItem:{
        name:string,
        address: string,
        city:string,
        state:string,
        zip:string,
        phone:string,
    };
    clinicLocation:{
        image_url:string,
        address:string,
        city:string,
        email:string,
        id:any,
        latitude:number,
        longitude:number,
        name:string,
        phone:string,
        state:string,
        zip:string,
        hcf_id:any,
    };
    deleteClinicName:any;
    sub:any;
    constructor(private router:Router,http_method: HttpMethod,private route: ActivatedRoute) {
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.listClinicLocation = [];
        this.oldListClinic = [];
    }
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            console.log(this.id);
        });
        this.getListClinicLocation();
        this.clinicLocation={
            image_url:null,
            address:null,
            city:null,
            email:null,
            id:null,
            latitude:null,
            longitude:null,
            name:null,
            phone:null,
            state:null,
            zip:null,
            hcf_id:this.id,
        }
    }

    getListClinicLocation()
    {
        return this.http_method.callApiNoToken(this.baseUrl+"/health_care_facilities/listlocation?hcfId="+this.id).subscribe(
            (res:any) => {
                this.checkAccessdenied(res);
                this.listClinicLocation = JSON.parse(res._body).Data;
                this.checkSizePage();
            },
            (error:any) => this.getListClinicLocation());
    }
    editLocation(location:any) {
        // console.log(location)
        this.editLocationItem = location;
    }
    confirmDeleteLocation(location:any){
        this.clinicLocation = location;
        $('#confirmDelete').modal('show');
    }
    showModalAddEdit(type:any,location:any){
        this.oldListClinic = this.listClinicLocation;

        if(type=='Add'){
            this.clinicLocation={
                image_url:null,
                address:null,
                city:null,
                email:null,
                id:this.id,
                latitude:0,
                longitude:0,
                name:null,
                phone:null,
                state:null,
                zip:null,
                hcf_id:this.id,
            }
            this.Image = null;
            let src = '';
            $('#image').attr('src', src);

        }
        else{
            this.oldUrl = location.image_url;
            this.clinicLocation = location;
        }
        this.typeModal = type;
        $('#AddEditModal').modal({backdrop: 'static',show:true});

    }
    hideModalLocation(){
        let src = this.oldUrl;
        $('#image').attr('src', src);
        this.getListClinicLocation();
        $('#AddEditModal').modal('hide');

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
    getLatLngForUpdate(value:any){
        return this.http_method.callApiNotAuth("https://maps.googleapis.com/maps/api/geocode/json?address="+value).subscribe(
            (res:any) => {
                let Res = JSON.parse(res._body);
                if(Res.status != 'ZERO_RESULTS'){
                    let location= Res.results[0].geometry.location;
                    this.clinicLocation.latitude = location.lat;
                    this.clinicLocation.longitude = location.lng;
                    this.updateLocation();
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
        // console.log(this.clinicLocation);
        return this.http_method.postApiFile(this.baseUrl+"health_care_facilities/addhcflocations",this.clinicLocation,this.Image).subscribe(
            (res:any) => {
                this.checkAccessdenied(res);
                this.getListClinicLocation();
                $('#AddEditModal').modal('hide');

            },
            (error:any) => this.errorMessage = <any>error);

    }
    updateLocation(){
        if(this.Image){
            this.http_method.postApiFile(this.baseUrl + 'health_care_facilities/updatehcflocations',this.clinicLocation,this.Image).subscribe(
                (response:any) => {
                    this.checkAccessdenied(response);
                    this.getListClinicLocation();
                    $('#AddEditModal').modal('hide');
                },
                (error:any) => {
                    this.errorMessage = error;
                    this.errorMessage = 'update Fail';
                });
        }
        else{
            this.http_method.postApiNoToken(this.baseUrl + 'health_care_facilities/updatehcflocations',this.clinicLocation).subscribe(
                (response:any) => {
                    this.checkAccessdenied(response);
                    this.getListClinicLocation();
                    $('#AddEditModal').modal('hide');
                },
                (error:any) => {
                    this.errorMessage = error;
                    this.errorMessage = 'update Fail';
                });
        }
    }
    changeImage(event:any){
        // console.log(event.srcElement.files[0]);
        this.Image = event.srcElement.files;
        this.readFile(event.target.files[0]);
        var reader = new FileReader();

        reader.onload = function(e:any) {

            var src = e.target.result;
            $('#image').attr('src', src);
        };

        reader.readAsDataURL(event.target.files[0]);

    }
    readFile(file:any){
        // var reader = new FileReader();
        // let Url = reader.readAsDataURL(file);

    }
    deleteLocation(){
        return this.http_method.callApiNoToken(this.baseUrl+"health_care_facilities/deletehcflocations?hcfId="+this.clinicLocation.id).subscribe(
            (res:any) => {
                this.checkAccessdenied(res);
                this.listClinicLocation.splice(this.indexDelete,1);
                this.getListClinicLocation();
                $('#confirmDelete').modal('hide');
            },
            (error:any) => this.errorMessage = <any>error);

    }
    chooseImage(){
        $('#file').click()
    }
    checkAccessdenied(res:any){
        if(JSON.parse(res._body).Status=="access is denied"){
            sessionStorage.clear();
            this.router.navigate(['/admin/', 'login']);
        }
    }
    selectPage(){
        this.checkSizePage();
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
