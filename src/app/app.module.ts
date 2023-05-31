import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';

export const translateHttpLoaderFactory = (httpClient: HttpClient) =>
  new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule,FormsModule,
    ReactiveFormsModule, IonicModule.forRoot(), TranslateModule.forRoot({
    loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient],
    },
}), AppRoutingModule,
ServiceWorkerModule.register('ngsw-worker.js', {
  // enabled: !isDevMode(),
  enabled: true,
  // Register the ServiceWorker as soon as the application is stable
  // or after 30 seconds (whichever comes first).
  registrationStrategy: 'registerWhenStable:30000'
}),
],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
