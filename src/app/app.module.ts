import { InjectionToken, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ElementComponent } from './element/element.component';

import { HttpClientModule } from '@angular/common/http';

import { StoreModule } from '@ngrx/store';
import { customElementsReducer } from './rxjs/reducer';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [AppComponent, ElementComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot({}),
    StoreModule.forFeature(
      'updateComponentFeature',
      new InjectionToken<any>('componentPropertiesReducer', {
        factory: () => customElementsReducer,
      })
    ),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(injector: Injector) {
    const testAngEl = createCustomElement(ElementComponent, { injector });
    customElements.define('rtl-element', testAngEl);
  }
}
