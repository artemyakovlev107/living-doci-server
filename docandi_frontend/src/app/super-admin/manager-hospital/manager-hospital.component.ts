declare var $ : any;
import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {HttpMethod} from "../../shared/services/http.method";
@Component({
    moduleId: module.id,
    selector: 'manager-hospital',
    templateUrl: 'manager-hospital.component.html',
    providers: [ HttpMethod]

})
export class ManagerHospitalComponent {


}
