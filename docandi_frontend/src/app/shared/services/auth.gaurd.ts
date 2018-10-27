import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { tokenNotExpired, AuthHttp } from 'angular2-jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(activatedRoute: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {

        if (localStorage.getItem('user')) {
            return true;
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }


}

