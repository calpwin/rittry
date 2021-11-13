import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { CustomMovableElementService } from '../services/custom-movable-element.service';
import {
  changedSpaceMediaAction,
  CustomElementsState,
} from './reducer';

@Injectable()
export class ChangedSpaceMediaEffects {
  loadPhotos$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(changedSpaceMediaAction),
        map(({ media }) => {
          this._customMovableElementService.recreateFromStorage(media);
          return media;
        })
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly _customMovableElementService: CustomMovableElementService,
    private readonly _store: Store<CustomElementsState>
  ) {}
}
