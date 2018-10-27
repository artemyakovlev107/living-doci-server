import { CommonDataService } from './../../shared/services/common-data.service';
declare var $: any;
import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpMethod } from "../../shared/services/http.method";
@Component({
    moduleId: module.id,
    selector: 'my-clinic-cmp',
    templateUrl: 'my-clinic.component.html',
    providers: [HttpMethod],
    styleUrls: ['my-clinic.component.css'],
})
export class MyClinicComponent {
    baseUrl: string;
    errorMessage: string = null;
    listClinicLocation: Array<Object>;
    successMessage: string;
    listMember: Array<Object>;
    currentClinic: {
        id: number,
        name: string,
        image_url: string,
        introduction: any,
        input_code: string,
        rxgrp: string,
        discount_card_image_url: string
    };
    editClinicItem: { id: any };
    showEditClinic: boolean = false;
    editLocationItem: {
        address: string,
        city: string,
        state: string,
    }
    editMemberItem: { id: any, role: any };
    oldListClinic: Array<Object>;
    editMode = false;
    userEditMode = false;
    member: { id: number, full_name: string };
    memberAdd: {
        full_name: string,
        email: string,
        role: any
    };
    typeModal: string;
    http_method: any;

    clinicLocation: {
        image_url: string,
        address: string,
        city: string,
        email: string,
        id: string,
        latitude: number,
        longitude: number,
        name: string,
        phone: string,
        state: string,
        zip: string,
    };
    contentIntroduction: any;
    showMess: boolean = false;
    currentImageUrl: string;
    indexDelete: number;
    Image: any;
    router: any;
    oldUrl: string = null;
    sending: boolean = false;
    currentUser: any;
    newRole: any;
    ImageSavingCard: any;
    SavingCard: {
        rxgrp: any;
        input_code: any;
    };
    memberChoosed: {
        id: any,
        full_name: any
    };
    goal: number = 0;
    constructor(http_method: HttpMethod, element: ElementRef, router: Router, private common: CommonDataService) {
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.router = router;
        this.currentClinic = {
            id: 0,
            name: null,
            image_url: null,
            introduction: null,
            input_code: null,
            rxgrp: null,
            discount_card_image_url: null
        }
        if (localStorage.getItem('currentClinic')) {
            this.currentClinic = JSON.parse(localStorage.getItem('currentClinic'));
            this.contentIntroduction = this.currentClinic.introduction;
        }
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.listClinicLocation = [];
        this.oldListClinic = [];
        this.getListClinicLocation();
        this.getListMember();
        this.memberAdd = {
            full_name: null,
            email: null,
            role: 0
        }

        this.editMemberItem = {
            id: null,
            role: null,
        }
        this.clinicLocation = {
            image_url: '',
            address: null,
            city: null,
            email: null,
            id: null,
            latitude: null,
            longitude: null,
            name: null,
            phone: null,
            state: null,
            zip: null
        }
        this.listMember = [];
        this.member = {
            id: null, full_name: null
        }

        this.SavingCard = {
            rxgrp: null,
            input_code: null,
        }
        this.editClinicItem = {
            id: null
        }
    }

    ngOnInit() {
        this.getClinic();
        this.memberChoosed = {
            id: null,
            full_name: null
        };
    }
    getListClinicLocation() {
        return this.http_method.callApi(this.baseUrl + "health_care_facilities/getlisthcflocations").subscribe(
            (res: any) => {
                this.checkAccessdenied(res);
                this.listClinicLocation = JSON.parse(res._body).Data;
                localStorage.setItem('listClinicLocation', JSON.stringify(this.listClinicLocation));
            },
            (error: any) => { this.requestErr() });
    }
    //edit Location
    editLocation(location: any) {
        // console.log(location)
        this.editLocationItem = location;
    }
    getLatLngForAdd(value: any) {
        return this.http_method.callApiNotAuth("https://maps.googleapis.com/maps/api/geocode/json?address=" + value).subscribe(
            (res: any) => {
                let Res = JSON.parse(res._body);
                if (Res.status != 'ZERO_RESULTS') {
                    let location = Res.results[0].geometry.location;
                    this.clinicLocation.latitude = location.lat;
                    this.clinicLocation.longitude = location.lng;
                    this.addLocation();
                }
                else {
                    alert("This isn’t a valid address. Please check and retype the address again.");
                }
            },
            (error: any) => {
                // console.log(error)
            });

    }
    getLatLngForUpdate(value: any) {
        return this.http_method.callApiNotAuth("https://maps.googleapis.com/maps/api/geocode/json?address=" + value).subscribe(
            (res: any) => {
                let Res = JSON.parse(res._body);
                if (Res.status != 'ZERO_RESULTS') {
                    let location = Res.results[0].geometry.location;
                    this.clinicLocation.latitude = location.lat;
                    this.clinicLocation.longitude = location.lng;
                    this.updateLocation();
                }
                else {
                    alert("This isn’t a valid address. Please check and retype the address again.");
                }
            },
            (error: any) => {
                // console.log(error)
            });

    }
    updateLocation() {
        if (this.Image) {
            this.http_method.postApiFile(this.baseUrl + 'health_care_facilities/updatehcflocations', this.clinicLocation, this.Image).subscribe(
                (response: any) => {
                    this.checkAccessdenied(response);
                    this.getListClinicLocation();
                    $('#AddEditModal').modal('hide');
                },
                (error: any) => {
                    this.errorMessage = error;
                    this.errorMessage = 'update Fail';
                });
        }
        else {
            this.http_method.postApi(this.baseUrl + 'health_care_facilities/updatehcflocations', this.clinicLocation).subscribe(
                (response: any) => {
                    this.checkAccessdenied(response);
                    this.getListClinicLocation();
                    $('#AddEditModal').modal('hide');
                },
                (error: any) => {
                    this.errorMessage = error;
                    this.errorMessage = 'update Fail';
                });
        }
    }
    addLocation() {
        return this.http_method.postApiFile(this.baseUrl + "health_care_facilities/addhcflocations", this.clinicLocation, this.Image).subscribe(
            (res: any) => {
                this.checkAccessdenied(res);
                this.getListClinicLocation();
                $('#AddEditModal').modal('hide');

            },
            (error: any) => this.errorMessage = <any>error);

    }
    showModalAddEdit(type: any, location: any) {
        this.oldListClinic = this.listClinicLocation;

        if (type == 'Add') {
            this.clinicLocation = {
                image_url: '',
                address: null,
                city: null,
                email: null,
                id: null,
                latitude: 0,
                longitude: 0,
                name: null,
                phone: null,
                state: null,
                zip: null,

            }
            this.Image = null;
            let src = '';
            $('#image').attr('src', src);

        }
        else {
            this.oldUrl = location.image_url;
            this.clinicLocation = location;
        }
        this.typeModal = type;
        $('#AddEditModal').modal({ backdrop: 'static', show: true });

    }
    hideModalLocation() {
        let src = this.oldUrl;
        $('#image').attr('src', src);
        this.getListClinicLocation();
        $('#AddEditModal').modal('hide');

    }

    getListMember() {
        return this.http_method.callApi(this.baseUrl + "user/listhcfuser").subscribe(
            (res: any) => {
                this.checkAccessdenied(res);
                this.listMember = JSON.parse(res._body).Data;

            },
            (error: any) => this.errorMessage = <any>error);
    }
    inviteMember() {
        this.sending = true;
        return this.http_method.postApi(this.baseUrl + "user/inviteuser", this.memberAdd).subscribe(
            (res: any) => {
                this.sending = false;
                this.checkAccessdenied(res);
                this.showMess = true;
                let response = JSON.parse(res._body);
                if (response.Status == 'success') {
                    this.successMessage = "Success invite member";
                    this.getListMember();
                    this.editMemberItem.id = 'Done';

                }
                else {
                    this.errorMessage = response.Message;

                }
                setTimeout(() => {
                    this.showMess = false;
                    this.errorMessage = null;
                    this.successMessage = null;
                }, 2000);
            },
            (error: any) => {
                this.sending = false;
                this.errorMessage = error;
            });

    }
    newMember() {
        this.editMemberItem = { id: 'NEW', role: 0 };
        this.memberAdd.email = null;
        this.memberAdd.full_name = null;

    }
    cancelEditMember() {
        this.editMemberItem.id = 'Done';
    }
    changeImage(event: any) {
        // console.log(event.srcElement.files[0]);
        this.Image = event.srcElement.files;
        this.readFile(event.target.files[0]);
        var reader = new FileReader();

        reader.onload = function (e: any) {

            var src = e.target.result;
            $('#image').attr('src', src);
        };

        reader.readAsDataURL(event.target.files[0]);

    }
    readFile(file: any) {
        // var reader = new FileReader();
        // let Url = reader.readAsDataURL(file);

    }
    confirmDeleteLocation(location: any, index: any) {
        this.clinicLocation = location;
        this.indexDelete = index;
        $('#confirmDelete').modal('show');
    }
    deleteLocation() {
        return this.http_method.callApiHadParram(this.baseUrl + "health_care_facilities/deletehcflocations?hcfId=" + this.clinicLocation.id).subscribe(
            (res: any) => {
                this.checkAccessdenied(res);
                this.listClinicLocation.splice(this.indexDelete, 1);
                this.getListClinicLocation();
                $('#confirmDelete').modal('hide');
            },
            (error: any) => this.errorMessage = <any>error);

    }
    chooseImage() {
        $('#file').click()
    }
    confirmDeleteMember(member: any, index: number) {
        this.member = member;
        this.indexDelete = index;
        $('#confirmDeleteMember').modal('show');
    }
    deleteMember() {
        return this.http_method.callApiHadParram(this.baseUrl + "user/removemember?userId=" + this.member.id).subscribe(
            (res: any) => {
                this.checkAccessdenied(res);
                this.listMember.splice(this.indexDelete, 1);
                $('#confirmDeleteMember').modal('hide');
            },
            (error: any) => this.errorMessage = <any>error);

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
    editClinic() {
        this.showEditClinic = true;
        // console.log(this.currentClinic);
        this.Image = null;
    }
    chooseImageClinic() {
        $('#fileClinic').click()
    }
    changeImageClinic(event: any) {
        this.Image = event.srcElement.files;
        this.readFile(event.target.files[0]);
        var reader = new FileReader();
        reader.onload = function (e: any) {
            var src = e.target.result;
            $('#imageClinic').attr('src', src);
        };

        reader.readAsDataURL(event.target.files[0]);
    }
    cancelEditClinic() {
        this.Image = null;
        this.showEditClinic = false;
        let src = this.currentClinic.image_url;
        $('#imageClinic').attr('src', src);
        this.currentClinic = JSON.parse(localStorage.getItem('currentClinic'));
    }
    UpdateClinic() {
        if (this.Image) {
            this.http_method.postApiFile(this.baseUrl + 'health_care_facilities/updatehcf', { name: this.currentClinic.name }, this.Image).subscribe(
                (response: any) => {
                    this.showEditClinic = false;
                    this.getClinic();
                    let src: string = null;
                    $('#image').attr('src', src);
                },
                (error: any) => {
                    this.errorMessage = error;
                    this.errorMessage = 'update Fail';
                });
        }
        else {
            this.http_method.postApi(this.baseUrl + 'health_care_facilities/updatehcf', { name: this.currentClinic.name }).subscribe(
                (response: any) => {
                    this.showEditClinic = false;
                    this.getClinic();
                    let src: string = null;
                    $('#image').attr('src', src);
                },
                (error: any) => {
                    this.errorMessage = error;
                    this.errorMessage = 'update Fail';
                });
        }
    }
    updateIntroduction() {
        this.http_method.postApi(this.baseUrl + 'health_care_facilities/updateintroduction', { introduction: this.contentIntroduction }).subscribe(
            (response: any) => {
                this.getClinic();
                $('#modalIntroduction').modal('hide');
            },
            (error: any) => {

            });
    }
    defaultIntroduction() {
        this.contentIntroduction = "<p><strong>" + this.currentClinic.name + " has partnered with local pharmacies through a federal program. This program is designed to:</strong></p> <ul> <li><u>help patients save money on medications</u></li> <li><u>support " + this.currentClinic.name + " with savings</u></li> </ul>"
    }
    showModalIntroduction() {
        $('#modalIntroduction').modal('show');
        this.contentIntroduction = this.currentClinic.introduction;
    }
    getClinic() {
        return this.http_method.callApi(this.baseUrl + 'health_care_facilities/gethcfdetails').subscribe(
            (clinic: any) => {
                this.currentClinic = JSON.parse(clinic._body).Data;
                localStorage.setItem('currentClinic', JSON.stringify(this.currentClinic));
                this.SavingCard.input_code = this.currentClinic.input_code;
                this.SavingCard.rxgrp = this.currentClinic.rxgrp;
                var src = this.currentClinic.discount_card_image_url;
                $('#ImgSavingCard').attr('src', src);
            },
            (error: any) => { this.requestErr() });
    }
    updateRole(id: any) {
        // console.log(this.memberAdd.role)
        this.http_method.postApi(this.baseUrl + 'user/changerole', { user_id: id, role: this.memberAdd.role }).subscribe(
            (response: any) => {
                this.getListMember()
            },
            (error: any) => {
                this.errorMessage = error;
                this.errorMessage = 'update Fail';
            });
    }
    showModalInfoSavingCard() {
        $('#modalSavingCardInfo').modal({ backdrop: 'static', show: true });
    }
    chooseImageSavingCard() {
        $('#fileSavingCard').click()
    }
    changeImageSavingCard(event: any) {
        this.ImageSavingCard = event.srcElement.files;
        this.readFile(event.target.files[0]);
        var reader = new FileReader();
        reader.onload = function (e: any) {
            var src = e.target.result;
            $('#ImgSavingCard').attr('src', src);
        };

        reader.readAsDataURL(event.target.files[0]);
    }
    updateSavingCard() {
        if (this.ImageSavingCard) {
            this.http_method.postApiFile(this.baseUrl + 'health_care_facilities/updatecardinfo', this.SavingCard, this.ImageSavingCard).subscribe(
                (response: any) => {
                    this.checkAccessdenied(response);
                    this.getClinic();
                    $('#modalSavingCardInfo').modal('hide');
                },
                (error: any) => {
                });
        }
        else {
            this.http_method.postApi(this.baseUrl + 'health_care_facilities/updatecardinfo', this.SavingCard).subscribe(
                (response: any) => {
                    this.checkAccessdenied(response);
                    this.getClinic();
                    $('#modalSavingCardInfo').modal('hide');
                },
                (error: any) => {
                });
        }
    }
    cancelUpdateSavingCard() {
        this.getClinic();
        $('#modalSavingCardInfo').modal('hide');
    };
    setGoalModal(member: any) {
        this.memberChoosed = member;
        this.goal = Object.assign(member.patient_goal)
        // this.goal = member.patient_goal;
        $('#modalSetGoal').modal('show');
    }
    setGoal(goal: any) {
        this.http_method.postApi(this.baseUrl + 'user/addgoal', { user_id: this.memberChoosed.id, goal: goal }).subscribe(
            (response: any) => {
                this.checkAccessdenied(response);
                this.getListMember();
                $('#modalSetGoal').modal('hide');
            },
            (error: any) => {
            });
    }
    showMaping() {
        $('#modalMapping').modal('show')
    }
    submitMapFile(data: any) {
        if (!data.bubbles) {
            this.common.toggleLoading(true);
            this.http_method.postApi(this.baseUrl + 'hcf/addbaseline', data).map((res: any) => res.json()).subscribe(
                (res: any) => {
                    this.common.toggleLoading(false);
                    if (res.Status == "error") {
                        alert(res.Message)
                    } else {
                        $('#modalMapping').modal('hide');
                    }
                },
                (error: any) => {
                    this.common.toggleLoading(false);
                });
        }
    }
}
