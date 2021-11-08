import { CustomMovableElementService } from './../services/custom-movable-element.service';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { removeCustomElementAction } from './reducer';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { CustomElementRepository } from '../repositories/custom-element.repository';

@Injectable()
export class RemoveCustomElementEffects {
  loadPhotos$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(removeCustomElementAction),
        map(({ element, fromStorage }) => {
          const movableEl = this._customMovableElementService.getElement(
            element.uid
          );

          if (!movableEl) return element;

          this._customMovableElementService.removeElement(movableEl);

          this._customElementRepository.removeElement(element.uid, fromStorage);

          return element;
        })
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly _customElementRepository: CustomElementRepository,
    private readonly _customMovableElementService: CustomMovableElementService
  ) {}
}
