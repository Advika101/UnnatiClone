import { Component, HostListener, NgZone } from '@angular/core';
import { AlertController, MenuController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from './core/constants/localStorage.keys';
import * as _ from 'lodash-es';
import { UserService,AuthService, HttpService} from './core/services';
import { Router} from '@angular/router';
import { ProfileService } from './core/services/profile/profile.service';
import { Location } from '@angular/common';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from './core/services/localStorage/localstorage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  user:any;
  isMentor:any;
  showAlertBox = false;
  deferredPrompt: any;
  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(e:any) {
    e.preventDefault();
    this.deferredPrompt = e;
  }

  constructor(
    private translate :TranslateService,
    private platform : Platform,
    private localStorage: LocalStorageService,
    public menuCtrl:MenuController,
    private userService:UserService,
    private router: Router,
    private http: HttpService,
    private authService:AuthService,
    private profile: ProfileService,
    private zone:NgZone,
    private _location: Location,
    private alert: AlertController,
  ) {
    this.initializeApp();
    this.router.navigate(["/"]);
  }

  addToHomeScreen() {
    if (this.deferredPrompt !== undefined && this.deferredPrompt !== null) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice
      .then((choiceResult:any) => {
        this.deferredPrompt = null;
      });
    }
}
  initializeApp() {
    this.platform.ready().then(() => {
      this.setHttpHeaders().then(() => {
        this.languageSetting();
        window.addEventListener('beforeinstallprompt', (e) => {
          console.log(e)
          // Prevent Chrome 67 and earlier from automatically showing the prompt
          e.preventDefault();
          // Stash the event so it can be triggered later on the button event.
          this.deferredPrompt = e;
        // Update UI by showing a button to notify the user they can add to home screen
        });
      })
        this.localStorage.getLocalData(localKeys.USER_DETAILS).then((userDetails:any)=>{
          if(userDetails){
            this.getUser();
          }
        })
      // setTimeout(() => {
      //   document.querySelector('ion-menu').shadowRoot.querySelector('.menu-inner').setAttribute('style', 'border-radius:8px 8px 0px 0px');
      // }, 2000);

      this.userService.userEventEmitted$.subscribe(data=>{
        if(data){
          this.isMentor = data?.isAMentor;
          this.user = data;
        }
      })
      App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        this.zone.run(() => {
          const domain = environment.deepLinkUrl
          const slug = event.url.split(domain).pop();
          if (slug) {
            this.router.navigateByUrl(slug);
          }
        });
    });
    });
  }
  showInstallPromotion() {
    throw new Error('Method not implemented.');
  }

  async setHttpHeaders() {
    await this.http.setHeader();
    this.userService.userEventEmitted$.subscribe(async () => {
      await this.http.setHeader();
    })
  }

  languageSetting() {
    this.localStorage.getLocalData(localKeys.SELECTED_LANGUAGE).then(data =>{
      if(data){
        this.translate.use(data);
      } else {
      this.setLanguage('en');
      }
    }).catch(error => {
      this.setLanguage('en');
    })
  }

  setLanguage(lang:any){
    this.localStorage.setLocalData(localKeys.SELECTED_LANGUAGE,lang).then(data =>{
      this.translate.use(lang);
    }).catch(error => {
      this.translate.use(lang)
    })
  }

  logout(){
    this.translate.use("en")
    this.authService.logoutAccount();
  }
  
  getUser() {
    this.profile.profileDetails(false).then(profileDetails => {
      this.user = profileDetails;
      this.isMentor = this.user?.isAMentor
    })
  }
  goToProfilePage(){
    this.menuCtrl.close();
    this.router.navigate(['/tabs/profile']);
  }

  async menuItemAction(menu:any) {
    switch (menu.title) {
      case 'LANGUAGE': {
        this.alert.create({
          
        })
        break;
      }
    }
  }

  async showAlert(alertData:any){
    
  }

}

