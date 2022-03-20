import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { CustomMovableElementService } from '../services/custom-movable-element.service';
import { LocalStorageService } from '../services/local-storage.service';
import { addCustomElementAction, currentSpaceElementChangedAction, spaceMediaChangedAction } from './actions';
import {
  CustomElement,
  CustomElementsState,
  SpaceMedia,
} from './reducer';
import { elementsSelector, currentSpaceElementSelector } from './selectors';

@Injectable()
export class SpaceMediaChangedEffects {
  loadPhotos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(spaceMediaChangedAction),
      withLatestFrom(
        this.store$.select(elementsSelector),
        this.store$.select(currentSpaceElementSelector)),
      switchMap(([{ media }, els, spaceEl]) => {
        let elements =
          this._localStorageService.getCurrentMediaElemetModels(media) ?? [];

        let {rootCustomEl, actions$} = this.ensureRootCustomElement(elements);
        rootCustomEl = spaceEl ?? rootCustomEl;

        if (media && media !== SpaceMedia[SpaceMedia.None]) {
          elements.forEach((el) => {
            actions$.push(
              addCustomElementAction(
                new CustomElement(
                  el.id,
                  el.htmlCode,
                  el.appendTo,
                  el.styles,
                  el.attributes,
                  el.isElGroupRoot,
                  el.orderNumber
                )
              )
            );
          });
        }

        return [
          ...actions$,
          currentSpaceElementChangedAction({
            spaceElement: rootCustomEl,
          }),
        ];
      })
    )
  );

  private ensureRootCustomElement(els: CustomElement[]) {
    let rootCustomEl = els.find((x) => x.appendTo === '<root/>');
    let actions$: (CustomElement & TypedAction<"Add custom element">)[] = [];

    if (!rootCustomEl) {
      rootCustomEl = new CustomElement(
        CustomElement.rootElementId,
        'rittry-layout',
        '<root/>',
        [
          { name: 'width', value: '100%' },
          { name: 'height', value: '100%' },
        ]
      );

      actions$ = [addCustomElementAction(rootCustomEl)];
    }

    return {rootCustomEl, actions$};
  }

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<CustomElementsState>,
    private readonly _customMovableElementService: CustomMovableElementService,
    private readonly _localStorageService: LocalStorageService
  ) {}
}
