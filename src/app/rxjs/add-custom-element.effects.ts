import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map } from "rxjs/operators";
import { addCustomElementAction } from "./reducer";

// @Injectable()
// export class AddCustomElementEffects {
//   loadPhotos$ = createEffect(
//     () =>
//       this.actions$.pipe(
//         ofType(addCustomElementAction),
//         map((el) => {
//           this._customMovableElementService.recreateFromStorage(media);
//           return media;
//         })
//       ),
//     { dispatch: false }
//   );

//   constructor(
//     private readonly actions$: Actions,
//     private readonly _customElementRepository: CustomElementRepository,
//     private readonly _customMovableElementService: CustomMovableElementService,
//     private readonly _store: Store<CustomElementsState>
//   ) {}
// }
