import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestParams } from '../../interface/request-param';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash-es';
import { UserService } from '../user/user.service';
import { LocalStorageService } from '../localStorage/localstorage.service';
import { urlConstants } from '../../constants/urlConstants';
import { localKeys } from '../../constants/localStorage.keys';
import { AuthService } from '../auth/auth.service';
import { ModalController } from '@ionic/angular';
import { catchError, map } from 'rxjs/operators'
import { throwError } from 'rxjs';
import { ToastService } from '../toast/toast.service';


@Injectable({
  providedIn: 'root',
})
export class HttpService {
  baseUrl;
  private timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  httpHeaders: any;
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private localStorage: LocalStorageService,
    private injector: Injector,
    private toast: ToastService,
  ) {
    this.baseUrl = environment.baseUrl;
  }

  async setHeader(lang?:string): Promise<any> {
    return new Promise(async (resolve) => {
      try {
        let userToken = (await this.userService.getUserValue()) ? 'bearer ' + (await this.userService.getUserValue()).access_token : '';
        const headers = {
          'X-auth-token': userToken ? userToken : '',
          'Content-Type': 'application/json',
          'timeZone': this.timeZone,
          'accept-language': lang ? lang : 'en'
        };
        this.httpHeaders = headers;
        resolve(true)
      } catch (error) {
      }
    });
  }

  post(requestParam: RequestParams) {
    // if (!this.checkNetworkAvailability()) {
    //   throw Error(null);
    // }
    // const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
    let body = requestParam.payload ? requestParam.payload : {};
    // this.http.setDataSerializer('json');
    // this.http.setRequestTimeout(60);
    console.log(this.baseUrl + requestParam.url, body)
    return this.http.post(this.baseUrl + requestParam.url, body, {headers: this.httpHeaders}).pipe(
      map((data:any)=>{
      if (data.responseCode === "OK") {
        return data;
      }
    }),
    catchError((err) => {
      this.handleError(err);    //Rethrow it back to component
      throw Error(err);
    }))
      // .then((data: any) => {
      //   let result: any = JSON.parse(data.data);
      //   if (result.responseCode === "OK") {
      //     return result;
      //   }
      // }, error => {
      //   return this.handleError(error);
      // });
  }

  // get(config: any) {
    // console.log(this.httpHeaders);
    
    //   .pipe(
    //     catchError(this.handleError.bind(this))
    //   );
  // }

  get(requestParam: RequestParams) {
    // if (!this.checkNetworkAvailability()) {
    //   throw Error(null);
    // }
    // const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
    // this.http.setDataSerializer('json');
    // this.http.setRequestTimeout(60);
    console.log(this.httpHeaders)
    return this.http.get(`${this.baseUrl}${requestParam.url}`, {headers: this.httpHeaders}).pipe(
      map((data:any)=>{
        // if(data?.meta?.data?.length){
        //   this.openModal(data?.meta?.data[0]);
        // }
        if (data.responseCode === "OK") {
          return data;
        }
      })
      )
      // .then((data: any) => {
      //   let result: any = JSON.parse(data.data);
      //   if(result?.meta?.data?.length){
      //     this.openModal(result?.meta?.data[0]);
      //   }
      //   if (result.responseCode === "OK") {
      //     return result;
      //   }
      // }, error => {
      //   return this.handleError(error);
      // });
  }

  delete(requestParam: RequestParams) {
    // if (!this.checkNetworkAvailability()) {
    //   throw Error(null);
    // }
    // const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
    // this.http.setDataSerializer('json');
    // this.http.setRequestTimeout(60);
    return this.http.delete(this.baseUrl + requestParam.url, {headers: this.httpHeaders}).subscribe((data)=>{
    })
      // .then((data: any) => {
      //   let result: any = JSON.parse(data.data);
      //   if (result.responseCode === "OK") {
      //     return result;
      //   }
      // }, error => {
      //   return this.handleError(error);
      // });
  }

  //network check
  // checkNetworkAvailability() {
  //   if (!this.network.isNetworkAvailable) {
  //     this.toastService.showToast('MSG_PLEASE_NETWORK', 'danger')
  //     return false;
  //   } else {
  //   return true;
  //   }
  // }

  //token validation and logout 

  async getToken() {
    let token = _.get(this.userService.token, 'access_token');
    if (!token) {
      return null;
    }
    let isValidToken = this.userService.validateToken(token);
    if (!isValidToken) {
      let data: any = await this.getAccessToken();
      let access_token = _.get(data, 'access_token');
      if (!access_token) {
        let authService = this.injector.get(AuthService);
        authService.logoutAccount();
      }
      this.userService.token['access_token'] = access_token;
      this.localStorage.setLocalData(localKeys.TOKEN, JSON.stringify(this.userService.token));
    }
    let userToken = 'bearer ' + _.get(this.userService.token, 'access_token');
    return userToken;
  }

  async getAccessToken() {
    const config = {
      url: urlConstants.API_URLS.REFRESH_TOKEN,
      payload: {
        refreshToken: _.get(this.userService.token, 'refresh_token')
      },
      headers: {}
    };
    try {
      let data: any = await this.post(config);
      let result = data.result;
      return result;
    }
    catch (error) {
    }
  }

  public handleError(result:any) {
    console.log(result);
    let msg = result.error;
    switch (result.status) {
      case 400:
      case 406:
      case 422:
        this.toast.showToast(msg ? msg.message : 'SOMETHING_WENT_WRONG', 'danger')
        break
      case 401:
        let auth = this.injector.get(AuthService);
        auth.logoutAccount(true);
        break
      default:
        this.toast.showToast(msg ? msg.message : 'SOMETHING_WENT_WRONG', 'danger')
    }
  }

  // async openModal(sessionData) {
  //   const modal = await this.modalController.create({
  //     component: FeedbackPage,
  //     componentProps: {
  //       data: sessionData,
  //     }
  //   });
  //   return await modal.present();
  // }
}
