import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class PrivateGuard  {
  constructor(private userService:UserService,private router: Router){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.userService.getUserValue().then((result:any) => {
      if (result) {
        return true;
      }
      else {
        this.router.navigate(['/auth/landing']);
        return false;
      }
    }).catch(() => {
      this.router.navigate(['/auth/landing']);
        return false;
    });
  
  }
  
}
