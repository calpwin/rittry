import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { CustomElementService } from '../services/custom-element.service';
import { removeCustomElementAction } from './actions';

@Injectable()
export class RemoveCustomElementEffects {
  loadPhotos$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(removeCustomElementAction),
        map(({ element, fromStorage }) => {
          const movableEl = this._customElementService.getElement(
            element.id
          );

          if (!movableEl) return element;

          this._customElementService.removeElement(movableEl.customEl);

          return element;
        })
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly _customElementService: CustomElementService
  ) {}
}
