declare var $ : any;
import {Component} from '@angular/core';
import {Router,ActivatedRoute} from '@angular/router';
import {HttpMethod} from "../../../shared/services/http.method";
@Component({
    moduleId: module.id,
    selector: 'admin-pharmacy',
    templateUrl: 'admin-pharmacy.component.html',
    providers: [ HttpMethod]

})
export class AdminPharmacyComponent {
    baseUrl:string;
    http:any;
    http_method:any;
    router:any
    allPharmacies:any;
    rowsOnPage:number=10;
    sub:any;
    hcfId:any;
    pharmacy:{
        logo:any,
        address:any,
        city:any,
        created_at:any,
        email:any,
        health_care_facility_id:any,
        id:any,
        latitude:any,
        longitude:any,
        name:any,
        phone:any,
        showRow:any,
        state:any,
        zip:any
    };
    Image:any;
    typeModal:string;
    constructor(http_method: HttpMethod,router:Router,private route: ActivatedRoute){
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.pharmacy={
            logo:null,
            address:null,
            city:null,
            created_at:null,
            email:null,
            health_care_facility_id:null,
            id:null,
            latitude:null,
            longitude:null,
            name:null,
            phone:null,
            showRow:null,
            state:null,
            zip:null
        };
        this.sub = this.route.params.subscribe(params => {
            this.hcfId = +params['id']; // (+) converts string 'id' to a number
            // console.log(this.hcfId);
        });
        this.getAllPharmacy();
    }
    getAllPharmacy(){
        return this.http_method.callApiNoToken(this.baseUrl+"pharmacy/allpharmacy?hcfId="+this.hcfId).subscribe(
            (res:any) => {
                if(JSON.parse(res._body).Status=="access is denied"){
                    sessionStorage.clear();
                    this.router.navigate(['/', 'login']);
                }
                else{
                    this.allPharmacies = JSON.parse(res._body).Data;
                    this.checkSizePage();
                }
            },
            (error:any) => this.getAllPharmacy());
    }
    selectPage(){this.checkSizePage();}
    modalAddPhar(type:any,phar:any) {
        if (type == 'Add') {
            this.pharmacy={
                logo:null,
                address:null,
                city:null,
                created_at:null,
                email:null,
                health_care_facility_id:this.hcfId,
                id:null,
                latitude:null,
                longitude:null,
                name:null,
                phone:null,
                showRow:null,
                state:null,
                zip:null
            }

        }
        else
        {
            this.pharmacy = phar;
        }
        this.typeModal = type;
        $('#AddEditModal').modal({backdrop: 'static', show: true});
    }
    chooseImage(){
        $('#file').click()
    }
    readFile(file:any){
        // var reader = new FileReader();
        // let Url = reader.readAsDataURL(file);

    }
    changeImage(event:any){
        // console.log(event.srcElement.files[0]);
        this.Image = event.srcElement.files;
        this.readFile(event.target.files[0]);
        var reader = new FileReader();

        reader.onload = function(e:any) {

            var src:string = e.target.result;
            $('#image').attr('src', src);
        };

        reader.readAsDataURL(event.target.files[0]);

    }
    getLatLngForAdd(value:any){
        return this.http_method.callApiNotAuth("https://maps.googleapis.com/maps/api/geocode/json?address="+value).subscribe(
            (res:any) => {
                let Res = JSON.parse(res._body);
                if(Res.status != 'ZERO_RESULTS'){
                    let location= Res.results[0].geometry.location;
                    this.pharmacy.latitude = location.lat;
                    this.pharmacy.longitude = location.lng;
                    this.addPharmacy();
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
                    this.pharmacy.latitude = location.lat;
                    this.pharmacy.longitude = location.lng;
                    this.updatePharmacy();
                }
                else{
                    alert("This isn’t a valid address. Please check and retype the address again.");
                }
            },
            (error:any) => {
                // console.log(error)
            });

    }
    updatePharmacy(){
        if(this.Image){
            this.http_method.postApiFile(this.baseUrl + 'pharmacy/editpharmacy',this.pharmacy,this.Image).subscribe(
                (res:any) => {
                    this.getAllPharmacy();
                    $('#AddEditModal').modal('hide');
                    var src:string = null;
                    $('#image').attr('src', src);
                },
                (error:any) => {
                   alert('Update Fail');
                });
        }
        else{
            // console.log(this.pharmacy);
            this.http_method.postApi(this.baseUrl + 'pharmacy/editpharmacy',this.pharmacy).subscribe(
                (response :any)=> {
                    this.getAllPharmacy();

                    $('#AddEditModal').modal('hide');
                    var src:string = null;
                    $('#image').attr('src', src);
                },
                (error:any) => {
                    alert('Update Fail');
                });
        }
    }
    addPharmacy(){
        // console.log(this.pharmacy)
        return this.http_method.postApiFile(this.baseUrl+"pharmacy/addcontractpharmacy",this.pharmacy,this.Image).subscribe(
            (res:any) => {
                this.getAllPharmacy();
                $('#AddEditModal').modal('hide');
                let src:string = null;
                $('#image').attr('src', src);
            },
            (error:any) => {alert('Add pharmacy fail')});

    }
    hideModalPhar(){
        this.pharmacy={
            logo:null,
            address:null,
            city:null,
            created_at:null,
            email:null,
            health_care_facility_id:this.hcfId,
            id:null,
            latitude:null,
            longitude:null,
            name:null,
            phone:null,
            showRow:null,
            state:null,
            zip:null
        }
        this.getAllPharmacy();
        $('#AddEditModal').modal('hide');
        let src:string = null;
        $('#image').attr('src', src);
    }
    confirmDelete(phar:any){
        this.pharmacy = phar;
        $('#confirmDelete').modal('show');
    }
    deletePharmacy(){
        return this.http_method.callApiHadParram(this.baseUrl+"pharmacy/deletepharmacy?id="+this.pharmacy.id).subscribe(
            (res:any) => {
                $('#confirmDelete').modal('hide');
                this.getAllPharmacy();
            },
            (error:any) => {alert('Add pharmacy fail')});

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
