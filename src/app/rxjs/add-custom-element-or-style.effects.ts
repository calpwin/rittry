import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, withLatestFrom } from 'rxjs/operators';
import { LocalStorageService } from '../services/local-storage.service';
import { addCustomElementAction, groupElementsAction, addOrUpdateElementStyleAction } from './actions';
import {
  CustomElementsState,
} from './reducer';
import { elementsSelector, currentSpaceMediaSelector } from './selectors';

@Injectable()
export class AddCustomElementOrStyleEffects {
  loadPhotos$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addCustomElementAction, addOrUpdateElementStyleAction, groupElementsAction),
        withLatestFrom(
          this.store$.select(elementsSelector),
          this.store$.select(currentSpaceMediaSelector)
        ),
        switchMap(([_, els, media]) => {
          this._localStorageService.saveSpaceModel(els, media);

          return [];
        })
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly _localStorageService: LocalStorageService,
    private readonly store$: Store<CustomElementsState>
  ) {}
}
