import { InjectionToken, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ElementComponent } from './element/element.component';

import { HttpClientModule } from '@angular/common/http';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { StoreModule } from '@ngrx/store';
import { customElementsReducer } from './rxjs/reducer';
import { createCustomElement } from '@angular/elements';
import { SpaceComponent } from './space/space.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutComponent } from './component/layout/layout.component';
import { EffectsModule } from '@ngrx/effects';
import { RemoveCustomElementEffects } from './rxjs/remove-element.effects';
import { ChangedSpaceMediaEffects } from './rxjs/changed-space-media.effects';
import { ChangingSpaceMediaEffects } from './rxjs/changing-space-media.effect';

@NgModule({
  declarations: [AppComponent, ElementComponent, SpaceComponent, LayoutComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatIconModule,
    MatButtonModule,
    StoreModule.forRoot({}),
    StoreModule.forFeature(
      'updateComponentFeature',
      new InjectionToken<any>('componentPropertiesReducer', {
        factory: () => customElementsReducer,
      })
    ),
    BrowserAnimationsModule,
    EffectsModule.forRoot([RemoveCustomElementEffects, ChangingSpaceMediaEffects, ChangedSpaceMediaEffects]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(injector: Injector) {
    const testAngEl = createCustomElement(ElementComponent, { injector });
    customElements.define('rtl-element', testAngEl);

    const layoutEl = createCustomElement(LayoutComponent, { injector });
    customElements.define('rittry-layout', layoutEl);
  }
}
