import { HttpClientModule, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppRoutingModule } from '@spartacus/storefront';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { ExpressAddToCartComponentModule } from './components/express-add-to-cart/express-add-to-cart-component.module';
import { ExpressCartTotalsModule } from './components/express-cart-totals/express-cart-totals.module';
import { LogrocketModule } from './logrocket/logrocket.module';
import { SpartacusModule } from './spartacus/spartacus.module';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const devImports: any[] = [];
if (!environment.production) {
  devImports.push(StoreDevtoolsModule.instrument({
    maxAge: 25, // Retains last 25 states
    logOnly: environment.production, // Restrict extension to log-only mode
    autoPause: true, // Pauses recording actions and state changes when the extension window is not open
    connectInZone: true
  }));
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    SpartacusModule,
    LogrocketModule,

    // Demo Module For GooglePay / ApplePay Express checkout on Pdp
    ExpressAddToCartComponentModule,
    // Demo Module for GooglePay / ApplePay Express checkout on Cart Page
    ExpressCartTotalsModule,
    ...devImports,
  ],

  bootstrap: [AppComponent],
  providers: [provideHttpClient(withFetch(), withInterceptorsFromDi())]
})
export class AppModule {
}
