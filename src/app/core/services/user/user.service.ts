import { Injectable } from '@angular/core';
import { localKeys } from '../../constants/localStorage.keys';
import { LocalStorageService } from '../localStorage/localstorage.service';
import * as _ from 'lodash-es';
import jwt_decode from "jwt-decode";
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  token:any;
  baseUrl:any;
  userEvent = new Subject<any>();
  userEventEmitted$ = this.userEvent.asObservable();
  constructor(
    private localStorage: LocalStorageService,
    ) { 
      this.baseUrl = environment.baseUrl;
      this.getUserValue()
    }

  async getUserValue() {
    if(this.token)
      return this.token;
    return this.localStorage
    .getLocalData(localKeys.TOKEN)
    .then((data: any) => {
      this.token=JSON.parse(data);
      return data;
    })
      .catch(() => { });
  }

  validateToken(token:any){
    const tokenDecoded: any = jwt_decode(token);
    const tokenExpiryTime = moment(tokenDecoded.exp * 1000);
    const currentTime = moment(Date.now());
    const duration = moment.duration(tokenExpiryTime.diff(currentTime));
    const hourDifference = duration.asHours();
    return (hourDifference < 2) ? false : true;
  }
  
}
