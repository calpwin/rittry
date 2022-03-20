import { CustomElementService } from './custom-element.service';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, RendererFactory2 } from '@angular/core';
import { Store } from '@ngrx/store';
import { withLatestFrom } from 'rxjs/operators';
import { CustomElementsState } from '../rxjs/reducer';
import { CustomMovableElementService } from './custom-movable-element.service';
import {
  selectedElementSelector,
  currentSpaceElementSelector,
  addUiElementSelector,
  lastElementStyleChangedSelector,
  elementsSelector,
  changeAttributeElementSelector,
  changeGroupingElementsSelector,
} from '../rxjs/selectors';
import { CustomElementSelectableService } from './custom-element-selectable.service';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  constructor(
    @Inject(DOCUMENT) private readonly _document: Document,
    rendererFactory: RendererFactory2,
    private readonly _store: Store<CustomElementsState>,
    private readonly _customMovableElementService: CustomMovableElementService,
    private readonly _customElementService: CustomElementService,
    private readonly _customElementSelectableService: CustomElementSelectableService
  ) {}

  bindApplicationEvents() {
    this._store
      .select(selectedElementSelector)
      .pipe(withLatestFrom(this._store.select(currentSpaceElementSelector)))
      .subscribe(([selectedCustomEl, spaceEl]) => {
        this._customElementService.setCurrentSelectedElement(
          selectedCustomEl,
          spaceEl
        );
      });

    this._store
      .select(addUiElementSelector)
      .pipe(
        withLatestFrom(
          this._store.select(currentSpaceElementSelector),
          this._store.select(elementsSelector)
        )
      )
      .subscribe(([el, spaceEl, els]) => {
        if (!el) return;

        this._customElementService.appendElementToDom(el, spaceEl);

        if (!spaceEl) return;

        this._customElementSelectableService.removeAllSelectableElements();

        const htmlEl = this._document.getElementById(spaceEl!.id);
        if (!htmlEl) return;

        this._customElementSelectableService.makeSelectable(
          htmlEl,
          els
            .filter((x) => x.appendTo === spaceEl!.id)
            .map((x) => this._document.getElementById(x.id)!)
        );
      });

    this._store
      .select(lastElementStyleChangedSelector)
      .pipe(withLatestFrom(this._store.select(elementsSelector)))
      .subscribe(([style, els]) => {
        if (!style || !els) return;

        this._customElementService.changeElementStyles({
          el: els.find((x) => x.id === style.elId)!,
          styles: style.changedStyles,
        });
      });

    this._store.select(changeAttributeElementSelector).subscribe((changes) => {
      if (changes)
        this._customElementService.changeElementAttributes({
          el: changes.el,
          attributes: changes.changedAttributes,
        });
    });
  }
}
