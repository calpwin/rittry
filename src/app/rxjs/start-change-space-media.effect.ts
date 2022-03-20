import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, withLatestFrom } from 'rxjs/operators';
import { LocalStorageService } from '../services/local-storage.service';
import { startChangeSpaceMediaAction, rebuildSpaceAction, removeCustomElementAction, spaceMediaChangedAction, unGroupElementsAction, unGroupElementsFinishedAction } from './actions';
import {
  CustomElementsState,
  SpaceMedia,
} from './reducer';
import { currentSpaceMediaSelector, elementsSelector } from './selectors';

@Injectable()
export class StartChangeSpaceMediaEffects {
  loadPhotos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(startChangeSpaceMediaAction, rebuildSpaceAction, unGroupElementsFinishedAction),
      withLatestFrom(
        this.store$.select(elementsSelector),
        this.store$.select(currentSpaceMediaSelector)
      ),
      switchMap(([action, els, currentMedia]) => {
        let media = currentMedia;

        if (action.type === startChangeSpaceMediaAction.type) {
          media = action.media;
        }

        if (currentMedia !== SpaceMedia[SpaceMedia.None])
          this._localStorageService.saveSpaceModel(els, currentMedia);

        return [
          ...els.map((y) =>
            removeCustomElementAction({ element: y, fromStorage: false })
          ),
          spaceMediaChangedAction({ media }),
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
