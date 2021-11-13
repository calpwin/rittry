import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, withLatestFrom } from 'rxjs/operators';
import { LocalStorageService } from '../services/local-storage.service';
import {
  changedSpaceMediaAction,
  changeSpaceMediaSelector,
  changingSpaceMediaAction,
  CustomElementsState,
  elementsSelector,
  removeCustomElementAction,
  SpaceMedia,
} from './reducer';

@Injectable()
export class ChangingSpaceMediaEffects {
  loadPhotos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changingSpaceMediaAction),
      withLatestFrom(
        this.store$.select(elementsSelector),
        this.store$.select(changeSpaceMediaSelector)
      ),
      switchMap(([{ media }, els, currentMedia]) => {
        if (currentMedia !== SpaceMedia[SpaceMedia.None])
          this._localStorageService.saveSpaceModel(els, currentMedia);

        return [
          ...els.map((y) =>
            removeCustomElementAction({ element: y, fromStorage: false })
          ),
          changedSpaceMediaAction({ media }),
        ];
      })
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<CustomElementsState>,
    private readonly _localStorageService: LocalStorageService
  ) {}
}
