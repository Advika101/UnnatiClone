import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { LocalStorageService } from 'src/app/core/services/localStorage/localstorage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formData = {
    controls: [
      {
        name: 'email',
        label: 'Email',
        value: '',
        class: 'ion-no-margin',
        type: 'text',
        position: 'floating',
        errorMessage:'Please enter registered email ID',
        validators: {
          required: true,
        },
      },
      {
        name: 'password',
        label: 'Password',
        value: '',
        class: 'ion-margin',
        type: 'password',
        position: 'floating',
        errorMessage:'Please enter password',
        validators: {
          required: true,
          minLength: 8,
        },
      },
    ],
  };
  id: any;
  userDetails: any;
  public headerConfig: any = {
    backButton: {
      label: '',
      color: 'primary'
    },
    notification: false,
    signupButton: true
  };
  labels = ["LOGIN_TO_MENTOR_ED"];
  mentorId: any;
  constructor(
    private authService: AuthService, 
    private router: Router,
              private menuCtrl: MenuController, private activatedRoute: ActivatedRoute,
              private translateService: TranslateService, private localStorage: LocalStorageService) {
    this.menuCtrl.enable(false);
  }

  ngOnInit() {
    this.translateText();
  }

  async translateText() {
    this.translateService.get(this.labels).subscribe(translatedLabel => {
      let labelKeys = Object.keys(translatedLabel);
      labelKeys.forEach((key) => {
        let index = this.labels.findIndex(
          (label) => label === key
        )
        this.labels[index] = translatedLabel[key];
      })
    })
  }

  ionViewWillEnter() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.id = params['sessionId'] ? params['sessionId'] : this.id;
      this.mentorId = params['mentorId']? params['mentorId']:this.mentorId;
    });
  }

  onSubmit(form:any) {
    console.log(form)
    if (form.form.status=="VALID") {
      this.authService.loginAccount(form.form.value).subscribe((userDetails:any)=>{
        if (userDetails !== null) {
            this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
        }
        this.menuCtrl.enable(true);
      })
    }
  }

  action(event:any) {
    switch (event) {
      case 'signup':
        // this.goToSignup();
        break;
    }
  }
  goToForgotPassword(){

  }

}
