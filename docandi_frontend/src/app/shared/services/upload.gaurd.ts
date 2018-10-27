import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { tokenNotExpired, AuthHttp } from 'angular2-jwt';

@Injectable()
export class UploadGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(activatedRoute: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {

        if (localStorage.getItem('user')) {
            let user: any = JSON.parse(localStorage.getItem('user'))
            if (user.role == 4) {
                return true;
            }
            this.router.navigate(['/home']);
            return false;
        } else {
            this.router.navigate(['/home']);
            return false;
        }
    }


}

