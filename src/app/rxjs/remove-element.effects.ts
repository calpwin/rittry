import { CustomMovableElementService } from './../services/custom-movable-element.service';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { removeCustomElementAction } from './reducer';
import { map } from 'rxjs/operators';

@Injectable()
export class RemoveCustomElementEffects {
  loadPhotos$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(removeCustomElementAction),
        map(({ element, fromStorage }) => {
          const movableEl = this._customMovableElementService.getElement(
            element.id
          );

          if (!movableEl) return element;

          this._customMovableElementService.removeElement(movableEl);

          return element;
        })
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly _customMovableElementService: CustomMovableElementService
  ) {}
}
