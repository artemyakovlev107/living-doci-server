declare var $: any;

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { HttpMethod } from "../../shared/services/http.method";


@Component({
    moduleId: module.id,
    selector: 'my-pharmacies-cmp',
    templateUrl: 'my-pharmacies.component.html',
    providers: [HttpMethod]

})
export class MyPharmaciesComponent {
    baseUrl: string;
    http: any;
    response: any;
    errorMessage: any;
    http_method: any;
    allPharmacies: Array<any>;
    pharmacy: {
        logo: string,
        address: any,
        city: any,
        created_at: any,
        email: any,
        health_care_facility_id: any,
        id: any,

        latitude: any,
        longitude: any,
        name: any,
        phone: any,
        showRow: any,
        state: any,
        zip: any
    };
    currentClinic: { name: string }
    typeModal: string;
    router: any;
    Image: any;
    indexDelete: number;
    listBenefit: Array<{
        active: number,
        id: number
    }> = [];
    listBenefitOfPhar: Array<{
        id: number,
        length: number
    }>;
    constructor(http_method: HttpMethod, router: Router) {
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.getAllPharmacy();
        this.pharmacy = {
            logo:'',
            address: null,
            city: null,
            created_at: null,
            email: null,
            health_care_facility_id: 0,
            id: null,
            latitude: null,
            longitude: null,
            name: null,
            phone: null,
            showRow: null,
            state: null,
            zip: null
        }
        this.router = router;
        this.allPharmacies = [];

    }
    ngOnInit() {
        if (localStorage.getItem('currentClinic')) {
            this.currentClinic = JSON.parse(localStorage.getItem('currentClinic'));
        }
        else {
            this.currentClinic = {
                name: null
            }
        }
    }
    getAllPharmacy() {
        return this.http_method.callApi(this.baseUrl + "pharmacy/getallpharmacy").subscribe(
            (res: any) => {
                if (JSON.parse(res._body).Status == "access is denied") {
                    localStorage.clear();
                    this.router.navigate(['/', 'login']);
                }
                else {
                    this.allPharmacies = JSON.parse(res._body).Data;
                }
            },
            (error: any) => this.errorMessage = <any>error);
    }
    modalAddPhar(type: any, phar: any) {
        if (type == 'Add') {
            this.pharmacy = {
                logo:'',
                address: null,
                city: null,
                created_at: null,
                email: null,
                health_care_facility_id: 0,
                id: null,
                latitude: null,
                longitude: null,
                name: null,
                phone: null,
                showRow: null,
                state: null,
                zip: null
            }

        }
        else {
            this.pharmacy = phar;
        }
        this.typeModal = type;
        $('#AddEditModal').modal({ backdrop: 'static', show: true });
    }


    hideModalPhar() {
        this.pharmacy = {
            logo:null,
            address: null,
            city: null,
            created_at: null,
            email: null,
            health_care_facility_id: 0,
            id: null,
            latitude: null,
            longitude: null,
            name: null,
            phone: null,
            showRow: null,
            state: null,
            zip: null
        }
        this.getAllPharmacy();
        $('#AddEditModal').modal('hide');
        let src: string = null;
        $('#image').attr('src', src);
    }
    changeImage(event: any) {
        // console.log(event.srcElement.files[0]);
        this.Image = event.srcElement.files;
        this.readFile(event.target.files[0]);
        var reader = new FileReader();
        reader.onload = function (e: any) {
            var src: string = e.target.result;
            $('#image').attr('src', src);
        };

        reader.readAsDataURL(event.target.files[0]);

    }
    readFile(file: any) {
        // var reader = new FileReader();
        // let Url = reader.readAsDataURL(file);

    }
    chooseImage() {
        $('#file').click()
    }
    getLatLngForAdd(value: any) {
        return this.http_method.callApiNotAuth("https://maps.googleapis.com/maps/api/geocode/json?address=" + value).subscribe(
            (res: any) => {
                let Res = JSON.parse(res._body);
                if (Res.status != 'ZERO_RESULTS') {
                    let location = Res.results[0].geometry.location;
                    this.pharmacy.latitude = location.lat;
                    this.pharmacy.longitude = location.lng;
                    this.addPharmacy();
                }
                else {
                    alert("This isn’t a valid address. Please check and retype the address again.");
                }
            },
            (error: any) => {
                // console.log(error)
            });

    }
    addPharmacy() {
        // console.log(this.pharmacy)
        return this.http_method.postApiFile(this.baseUrl + "pharmacy/addcontractpharmacy", this.pharmacy, this.Image).subscribe(
            (res: any) => {
                this.getAllPharmacy();
                this.groupPharmacyByCity();
                $('#AddEditModal').modal('hide');
                let src: string = null;
                $('#image').attr('src', src);
            },
            (error: any) => this.errorMessage = <any>error);

    }
    getLatLngForUpdate(value: any) {
        return this.http_method.callApiNotAuth("https://maps.googleapis.com/maps/api/geocode/json?address=" + value).subscribe(
            (res: any) => {
                let Res = JSON.parse(res._body);
                if (Res.status != 'ZERO_RESULTS') {
                    let location = Res.results[0].geometry.location;
                    this.pharmacy.latitude = location.lat;
                    this.pharmacy.longitude = location.lng;
                    this.updatePharmacy();
                }
                else {
                    alert("This isn’t a valid address. Please check and retype the address again.");
                }
            },
            (error: any) => {
                // console.log(error)
            });

    }
    updatePharmacy() {
        if (this.Image) {
            this.http_method.postApiFile(this.baseUrl + 'pharmacy/editpharmacy', this.pharmacy, this.Image).subscribe(
                (res: any) => {
                    this.getAllPharmacy();
                    $('#AddEditModal').modal('hide');

                    this.groupPharmacyByCity();
                    var src: string = null;
                    $('#image').attr('src', src);
                },
                (error: any) => {
                    this.errorMessage = error;
                    this.errorMessage = 'update Fail';
                });
        }
        else {
            // console.log(this.pharmacy);
            this.http_method.postApi(this.baseUrl + 'pharmacy/editpharmacy', this.pharmacy).subscribe(
                (response: any) => {
                    this.getAllPharmacy();
                    this.groupPharmacyByCity();
                    $('#AddEditModal').modal('hide');
                    var src: string = null;
                    $('#image').attr('src', src);
                },
                (error: any) => {
                    this.errorMessage = error;
                    this.errorMessage = 'update Fail';
                });
        }
    }
    confirmDelete(phar: any, index: any) {
        this.pharmacy = phar;
        this.indexDelete = index;
        $('#confirmDelete').modal('show');
    }
    deletePharmacy() {
        return this.http_method.callApiHadParram(this.baseUrl + "pharmacy/deletepharmacy?id=" + this.pharmacy.id).subscribe(
            (res: any) => {
                this.allPharmacies.splice(this.indexDelete, 1);
                this.groupPharmacyByCity();
                $('#confirmDelete').modal('hide');
            },
            (error: any) => this.errorMessage = <any>error);

    }
    groupPharmacyByCity() {
        return this.http_method.callApi(this.baseUrl + "pharmacy/grouppharmacybycity").subscribe(
            (res: any) => {
                localStorage.setItem('groupPharmacyByCity', JSON.stringify(JSON.parse(res._body).Data));
            },
            (error: any) => this.errorMessage = <any>error);
    }
    showModalBenefit(phar: any) {
        this.pharmacy = phar;
        $('#listBenifit').modal('show');
    }
    getBenefit(phar: any) {
        return this.http_method.callApi(this.baseUrl + "benefit/listbenefit").subscribe(
            (res: any) => {
                this.listBenefit = JSON.parse(res._body).Data;
                for (var i = 0; i < this.listBenefit.length; ++i) {
                    this.listBenefit[i].active = 0;
                }
                this.showModalBenefit(phar);
                this.getBenefitByPhar(phar.id);
            },
            (error: any) => this.errorMessage = <any>error);
    }
    getBenefitByPhar(id: number) {
        return this.http_method.callApi(this.baseUrl + "pharmacy/pharmacybenefits/" + id).subscribe(
            (res: any) => {
                this.listBenefitOfPhar = JSON.parse(res._body).Data;
                if (this.listBenefitOfPhar.length > 0) {
                    for (var i = 0; i < this.listBenefit.length; i++) {
                        for (var j = 0; j < this.listBenefitOfPhar.length; j++) {
                            if (this.listBenefitOfPhar[j].id == this.listBenefit[i].id) {
                                this.listBenefit[i].active = 1;
                                break;
                            }
                        }
                    }
                }

                // console.log(this.listBenefit)
            },
            (error: any) => this.errorMessage = <any>error);
    }
    getBenifitByPhar(id: number) {
        return this.http_method.callApi(this.baseUrl + "pharmacy/pharmacybenefits/" + id).subscribe(
            (res: any) => {
                this.listBenefitOfPhar = JSON.parse(res._body).Data;

                // console.log(this.listBenefit)
            },
            (error: any) => this.errorMessage = <any>error);
    }
    chooseBenefit(benefit: any) {
        for (var i = 0; i < this.listBenefit.length; ++i) {
            if (this.listBenefit[i].id == benefit.id) {
                if (this.listBenefit[i].active == 1) {
                    this.listBenefit[i].active = 0
                }
                else {
                    this.listBenefit[i].active = 1;
                }
                // this.listBenefit[i].active = !this.listBenefit[i].active;
                break;
            }
        }
    }
    updateBenefit() {
        let request: {
            pharmacy_id: number,
            listBenefit: Array<Object>
        }
        request = {
            pharmacy_id: this.pharmacy.id,
            listBenefit: this.listBenefit
        }
        // console.log(request);
        this.http_method.postApi(this.baseUrl + 'pharmacy/updatepharmacybenefit', request).subscribe(
            (response: any) => {
                $('#listBenifit').modal('hide');
            },
            (error: any) => {
                this.errorMessage = error;
                this.errorMessage = 'update Fail';
            });
    }
    checkAccessdenied(res: any) {
        if (JSON.parse(res._body).Status == "access is denied") {
            localStorage.clear();
            this.router.navigate(['/', 'login']);
        }
    }
    requestErr() {
        localStorage.clear();
        this.router.navigate(['/', 'login']);
    }

}
