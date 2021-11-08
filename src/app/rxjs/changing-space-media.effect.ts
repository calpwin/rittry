import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap } from 'rxjs/operators';
import { CustomElementRepository } from '../repositories/custom-element.repository';
import {
  changedSpaceMediaAction,
  changingSpaceMediaAction,
  removeCustomElementAction,
} from './reducer';

@Injectable()
export class ChangingSpaceMediaEffects {
  loadPhotos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changingSpaceMediaAction),
      switchMap(({ fromMedia, toMedia }) => {
        const els = this._customElementRepository.getAllElements();

        return [
          ...els.map((y) =>
            removeCustomElementAction({ element: y, fromStorage: false })
          ),
          changedSpaceMediaAction({ media: toMedia }),
        ];
      })
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly _customElementRepository: CustomElementRepository
  ) {}
}
