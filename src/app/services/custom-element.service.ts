import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Store } from '@ngrx/store';
import Moveable from 'moveable';
import { KeyValuePairModel } from '../models/key-value-pair.model';
import { CustomElement, CustomElementsState } from '../rxjs/reducer';
import { CustomMovableElementService } from './custom-movable-element.service';
import {
  setSelectedElementAction,
  addOrUpdateElementStyleAction,
} from '../rxjs/actions';

@Injectable({
  providedIn: 'root',
})
export class CustomElementService {
  private readonly _renderer: Renderer2;
  private readonly _elements: {
    customEl: CustomElement;
    htmlEl: HTMLElement;
    moveable: Moveable | undefined;
    isSelected: boolean;
  }[] = [];
  private _appendingElementsWithoutRootYet: CustomElement[] = [];

  constructor(
    @Inject(DOCUMENT) private readonly _document: Document,
    rendererFactory: RendererFactory2,
    private readonly _store: Store<CustomElementsState>,
    private readonly _customMovableElementService: CustomMovableElementService
  ) {
    this._renderer = rendererFactory.createRenderer(null, null);
  }

  public setCurrentSelectedElement(
    selectedCustomEl: CustomElement | undefined,
    spaceEl: CustomElement | undefined
  ) {
    const currentSelectedEl = this._elements.find((x) => x.isSelected);

    if (currentSelectedEl) {
      currentSelectedEl.moveable?.destroy();
      currentSelectedEl.moveable = undefined;
      currentSelectedEl.isSelected = false;
    }

    if (!selectedCustomEl || !spaceEl) return;

    const containerHtmlEl = this._elements.find(
      (x) => x.customEl.id === spaceEl.id
    )!.htmlEl;

    const selectedEl = this._elements.find(
      (x) => x.customEl.id === selectedCustomEl.id
    )!;

    const isRootEl = CustomElement.isRootElement(selectedCustomEl);
    const positionStyle = selectedCustomEl.styles.find(
      (x) => x.name === 'position'
    );

    let moveable;
    if (!isRootEl && positionStyle?.value === 'relative') {
      moveable = this._customMovableElementService.makeMovable(
        containerHtmlEl,
        selectedEl.htmlEl,
        {
          draggable: false,
        }
      );
    } else if (!isRootEl) {
      moveable = this._customMovableElementService.makeMovable(
        containerHtmlEl,
        selectedEl.htmlEl
      );
    }

    selectedEl.moveable = moveable;
    selectedEl.isSelected = true;
  }

  public appendElementToDom(
    element: CustomElement,
    currentSpaceEl: CustomElement | undefined
  ) {
    if (!element) return;

    if (this._elements.find((x) => x.customEl.id === element.id)) {
      console.log(`Already exists element with uid: ${element.id}`);
      return;
    }

    const appendHtmlEl = this._renderer.createElement(element.htmlCode);
    const isRootEl = CustomElement.isRootElement(element);

    let appendToHtmlEl: HTMLElement | undefined;

    if (isRootEl) {
      appendToHtmlEl = this._document.querySelector(
        '.append-custom-el-to'
      ) as HTMLElement;
    } else {
      appendToHtmlEl = this._elements.find(
        (x) => x.customEl.id === element.appendTo
      )?.htmlEl;
    }

    if (!appendToHtmlEl) {
      console.log('Append elementTo not found');
      this._appendingElementsWithoutRootYet.push(element);
      return;
    }

    appendToHtmlEl.append(appendHtmlEl);

    this._renderer.setAttribute(appendHtmlEl, 'id', element.id);
    this._renderer.addClass(appendHtmlEl, 'custom-element');

    var styles = this.createElPrepareStyles(element.styles);

    if (
      // currentSpaceEl?.id !== CustomElement.rootElementId &&
      // currentSpaceEl?.id === element.id
      element.isElGroupRoot
    ) {
      this._renderer.addClass(appendHtmlEl, 'editable-group');
    }

    styles.forEach((prop) => {
      this._renderer.setStyle(appendHtmlEl, prop.name, prop.value);
    });

    if (element.appendTo === currentSpaceEl?.id || element.isElGroupRoot) {
      this.makeElSelectable(appendHtmlEl);
    }

    this._elements.push({
      customEl: element,
      htmlEl: appendHtmlEl,
      moveable: undefined,
      isSelected: false,
    });

    // Try to reappend elements that previously has no root element yet
    //
    if (this._appendingElementsWithoutRootYet.length > 0) {
      const appendingEls = this._appendingElementsWithoutRootYet.filter(
        (x) => x.appendTo === element.id
      );

      this._appendingElementsWithoutRootYet = [
        ...this._appendingElementsWithoutRootYet.filter((el) =>
          appendingEls.every((appEl) => appEl.id === el.id)
        ),
      ];
      appendingEls.forEach((el) => this.appendElementToDom(el, currentSpaceEl));
    }
  }

  public changeElementStyles(changes: {
    el: CustomElement;
    styles: KeyValuePairModel[];
  }) {
    const el = this._elements.find((x) => x.customEl.id === changes.el.id);

    if (!el) return;

    changes.styles.forEach((prop) => {
      this._renderer.setStyle(el.htmlEl, prop.name, prop.value);
    });

    const positionStyle = changes.styles.find((x) => x.name === 'position');

    if (el.moveable && positionStyle?.value === 'relative') {
      const container = el.moveable.container as HTMLElement;
      el.moveable.destroy();

      const clearPositionStyles = [
        { name: 'left', value: '0' },
        { name: 'top', value: '0' },
      ];
      clearPositionStyles.forEach((prop) => {
        this._renderer.setStyle(el.htmlEl, prop.name, prop.value);
      });

      el.moveable = this._customMovableElementService.makeMovable(
        container,
        el.htmlEl,
        {
          draggable: false,
        }
      );

      this._store.dispatch(
        addOrUpdateElementStyleAction({
          elId: el.customEl.id,
          styles: clearPositionStyles,
        })
      );
    } else if (el.moveable && positionStyle?.value === 'absolute') {
      const container = el.moveable.container as HTMLElement;
      el.moveable.destroy();

      el.moveable = this._customMovableElementService.makeMovable(
        container,
        el.htmlEl
      );
    }
  }

  public changeElementAttributes(changes: {
    el: CustomElement;
    attributes: KeyValuePairModel[];
  }) {
    const el = this._elements.find((x) => x.customEl.id === changes.el.id);

    if (!el) return;

    changes.attributes.forEach((prop) => {
      ~this._renderer.setAttribute(el.htmlEl, prop.name, prop.value);
    });
  }

  public removeElement(element: CustomElement) {
    const el = this._elements.find((x) => x.customEl.id === element.id);

    if (!el) return;

    let appendToEl = !CustomElement.isRootElement(element)
      ? document.getElementById(el.customEl.appendTo)
      : document.querySelector('.append-custom-el-to');

    el.moveable?.destroy();

    this._renderer.removeChild(appendToEl, el.htmlEl);

    const elIndex = this._elements.indexOf(el);

    this._elements.splice(elIndex, 1);
  }

  public destroyMovable(element: CustomElement) {
    const el = this._elements.find((x) => x.customEl.id === element.id);

    el?.moveable?.destroy();
  }

  public getElement(id: string) {
    return this._elements.find((x) => x.customEl.id === id);
  }

  public getAllElements() {
    return this._elements;
  }

  private createElPrepareStyles(
    styles: KeyValuePairModel[]
  ): KeyValuePairModel[] {
    const newStyles = [...styles];

    if (!newStyles.find((x) => x.name === 'position')) {
      newStyles.push({ name: 'position', value: 'relative' });
    }

    if (!newStyles.find((x) => x.name === 'display')) {
      newStyles.push({ name: 'display', value: 'block' });
    }

    // if (!newStyles.find((x) => x.name === 'width')) {
    //   newStyles.push({ name: 'width', value: '100px' });
    // }

    // if (!newStyles.find((x) => x.name === 'height')) {
    //   newStyles.push({ name: 'height', value: '50px' });
    // }

    return newStyles;
  }

  private makeElSelectable(appendHtmlEl: HTMLElement) {
    this._renderer.listen(appendHtmlEl, 'click', (event: MouseEvent) => {
      const elId = (event.currentTarget! as HTMLElement).getAttribute('id');

      if (!elId) return;

      this._store.dispatch(setSelectedElementAction({ elId }));

      event.stopImmediatePropagation();
    });
  }

  //#region Grouping
  public setPositionToGroupRootElement(cEl: CustomElement) {
    const groupRootEl = this._elements.find((x) => x.customEl.id === cEl.id);

    if (!groupRootEl) return;

    const groupEls = this._elements.filter(
      (x) => x.customEl.appendTo === cEl.id
    );

    if (groupEls.length === 0) {
      console.log('No elements were grouped');
      return;
    }

    let left = 0,
      top = 0,
      bottom = 0,
      right = 0;
    let width = 0;
    let height = 0;
    groupEls
      .forEach((el) => {
        const rect = el.htmlEl.getBoundingClientRect();

        if (left === 0 || left > rect.left) {
          left = rect.left;
        }

        if (top === 0 || top > rect.top) {
          top = rect.top;
        }

        if (bottom === 0 || bottom < rect.bottom) {
          bottom = rect.bottom;
        }

        if (right === 0 || right < rect.right) {
          right = rect.right;
        }

        width += Number.parseInt(el.customEl.styles.find(x => x.name === 'width')!.value);
        let elHeight = Number.parseInt(el.customEl.styles.find(x => x.name === 'height')!.value);
        height = elHeight > height ? elHeight : height;
        // width += rect.width;
      });

    this._store.dispatch(
      addOrUpdateElementStyleAction({
        elId: cEl.id,
        styles: [
          { name: 'position', value: 'absolute' },
          // { name: 'left', value: (left + window.scrollX).toString() + 'px' },
          // { name: 'top', value: (top + window.scrollY).toString() + 'px' },
          { name: 'left', value: '30%' },
          { name: 'top', value: '30%' },
          { name: 'width', value: width.toString() + 'px' },
          { name: 'height', value: height.toString() + 'px' },
        ],
      })
    );
  }
  //#endregion
}
