import { Injectable } from '@angular/core';
import Selecto from 'selecto';
import { getElementInfo } from 'moveable';
import {
  CustomElementsState
} from '../rxjs/reducer';
import { Store } from '@ngrx/store';
import { CustomMovableElementService } from './custom-movable-element.service';
import { addElementToGroupAction, removeElementFromGroupAction } from '../rxjs/actions';

@Injectable({
  providedIn: 'root',
})
export class CustomElementSelectableService {
  private _currentSelecto: Selecto | undefined;

  private _selectableElements: Selecto[] = [];

  constructor(
    private readonly _store: Store<CustomElementsState>,
    private readonly _customMovableElementService: CustomMovableElementService
  ) {}

  public makeSelectable(container: HTMLElement, selectableElements: HTMLElement[]) {
    this._currentSelecto = new Selecto({
      // The container to add a selection element
      container: container,
      // Selecto's root container (No transformed container. (default: null)
      rootContainer: document.getElementsByClassName('space')[0] as HTMLElement,
      // The area to drag selection element (default: container)
      dragContainer: container,
      // Targets to select. You can register a queryselector or an Element.
      selectableTargets: selectableElements,
      // Whether to select by click (default: true)
      selectByClick: true,
      // Whether to select from the target inside (default: true)
      selectFromInside: false,
      // After the select, whether to select the next target with the selected target (deselected if the target is selected again).
      continueSelect: false,
      // Determines which key to continue selecting the next target via keydown and keyup.
      toggleContinueSelect: 'shift',
      // The container for keydown and keyup events
      keyContainer: window,
      // The rate at which the target overlaps the drag area to be selected. (default: 100)
      hitRate: 100,
      getElementRect: getElementInfo,
    });

    this._currentSelecto.on('select', (e) => {
      e.added.forEach((el) => {
        el.classList.add('selected');

        this._store.dispatch(addElementToGroupAction({ elId: el.id }));

        e.inputEvent.stopImmediatePropagation();
      });
      e.removed.forEach((el) => {
        el.classList.remove('selected');

        this._store.dispatch(removeElementFromGroupAction({ elId: el.id }));

        e.inputEvent.stopImmediatePropagation();
      });
    });

    this._selectableElements.push(this._currentSelecto);
  }

  public removeAllSelectableElements() {
    this._selectableElements.forEach((x) => x.destroy());

    this._selectableElements = [];
    this._currentSelecto = undefined;
  }

  public getAllSelectableElements() {
    return this._selectableElements;
  }
}
