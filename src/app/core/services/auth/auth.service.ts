import { Injectable } from '@angular/core';
import { localKeys } from '../../constants/localStorage.keys';
import { LocalStorageService } from '../localStorage/localstorage.service';
import { HttpService } from '../http/http.service';
import * as _ from 'lodash-es';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { ProfileService } from '../profile/profile.service';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { urlConstants } from '../../constants/urlConstants';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl: any;
  constructor(
    private toast: ToastService,
    private localStorage: LocalStorageService,
    private httpService: HttpService,
    private router: Router,
    private userService: UserService,
    private profileService: ProfileService,
    private translate: TranslateService
  ) { }

  async createAccount(formData:any) {
    const config = {
      url: urlConstants.API_URLS.CREATE_ACCOUNT,
      payload: formData,
    };
    try {
      let data: any = await this.httpService.post(config);
      let userData = this.setUserInLocal(data);
      return userData;
    }
    catch (error) {
    }
  }

  loginAccount(formData:any) {
    // await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.ACCOUNT_LOGIN,
      payload: formData,
    };
    // try {
      return this.httpService.post(config).pipe(
        map((data:any)=>{
          console.log(data)
          this.toast.showToast(data.message, "success")
          this.setUserInLocal(data);
          return data.result.user;
      }))
      
      // this.loaderService.stopLoader();
    // }
    // catch (error) {
      // this.loaderService.stopLoader();
      // return null;
    }
  
  setUserInLocal(data:any) {
    const result = _.pick(data.result, ['refresh_token', 'access_token']);
    if (!result.access_token) { throw Error(); };
    this.userService.token = result;
    this.localStorage.setLocalData(localKeys.TOKEN, JSON.stringify(result)).then(()=>{
      this.profileService.getProfileDetailsAPI().subscribe((userData:any)=>{
        if (!userData) {
          this.localStorage.delete(localKeys.TOKEN);
          throw Error();
        }
        this.localStorage.setLocalData(localKeys.USER_DETAILS, JSON.stringify(userData)).then((data)=>{
          if(userData.preferredLanguage){
            this.localStorage.setLocalData(localKeys.SELECTED_LANGUAGE, JSON.stringify(userData.preferredLanguage));
            this.translate.use(userData.preferredLanguage);
          }
        })
        this.userService.userEvent.next(userData);
        return userData;
      })
    })
  }

  async logoutAccount(skipApiCall?: boolean) {
    // await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.LOGOUT_ACCOUNT,
      payload: {
        refreshToken: _.get(this.userService.token, 'refresh_token'),
      },
    };
    try {
      if (!skipApiCall) {
        await this.httpService.post(config);
      }
      this.localStorage.delete(localKeys.USER_DETAILS);
      this.localStorage.delete(localKeys.TOKEN);
      this.userService.token = null;
      this.userService.userEvent.next(null);
      this.router.navigate(['/auth/login'], {
        replaceUrl: true
      });
    }
    catch (error) {
    }
  }

  async acceptTermsAndConditions() {
    const config = {
      url: urlConstants.API_URLS.TERMS_CONDITIONS,
      payload: {},
    };
    try {
      let data = await this.httpService.post(config);
    }
    catch (error) {
    }
  }

}