import { getIntoGroupAction } from './../rxjs/actions';
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { switchMap, withLatestFrom } from "rxjs/operators";
import { getOutFromGroupAction, groupElementsAction, rebuildSpaceAction, unGroupElementsAction, unGroupElementsFinishedAction } from "../rxjs/actions";
import { CustomElementsState } from "../rxjs/reducer";
import { currentSpaceElementSelector, elementsSelector } from "../rxjs/selectors";
import { CustomElementService } from "../services/custom-element.service";

@Injectable()
export class GroupElementsEffects {
  groupElements$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(groupElementsAction, getOutFromGroupAction, getIntoGroupAction),
        switchMap(() => {
          return [rebuildSpaceAction()];
        })
      )
  );

  ungrouElements$ =createEffect(() =>
    this.actions$.pipe(
      ofType(unGroupElementsAction),
      withLatestFrom(this.store$.select(elementsSelector)),
      switchMap(([{ groupElId }, els]) => {
        const groupEls = els.filter((x) => x.appendTo === groupElId);

        groupEls.forEach((el) => {
          this._customElementService.destroyMovable(el);
        });

        return [unGroupElementsFinishedAction({ groupElId })];
      })
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<CustomElementsState>,
    private readonly _customElementService: CustomElementService
  ) {}
}
