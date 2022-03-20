import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, withLatestFrom } from 'rxjs/operators';
import { CustomElementSelectableService } from '../services/custom-element-selectable.service';
import { CustomElementService } from '../services/custom-element.service';
import { currentSpaceElementChangedAction } from './actions';
import {
  CustomElement,
  CustomElementsState,
} from './reducer';
import { currentSpaceElementSelector, elementsSelector } from './selectors';

@Injectable()
export class CurrentSpaceElementChangedEffects {
  loadPhotos$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(currentSpaceElementChangedAction),
        withLatestFrom(
          this.store$.select(elementsSelector)),
        switchMap(([{ spaceElement }, els]) => {
          const el = els.find((e) => e.id === spaceElement.id);

          if (!el) return [];

          if (!CustomElement.isRootElement(spaceElement)) {
            this._customElementService.setPositionToGroupRootElement(spaceElement);
          }

          return [];
        })
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<CustomElementsState>,
    private readonly _customElementService: CustomElementService,
    private readonly _customElementSelectableService: CustomElementSelectableService
  ) {}
}
