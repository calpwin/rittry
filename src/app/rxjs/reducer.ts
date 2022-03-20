import { createReducer, on } from '@ngrx/store';
import { KeyValuePairModel } from '../models/key-value-pair.model';
import {
  addCustomElementAction,
  removeCustomElementAction,
  setSelectedElementAction,
  addOrUpdateElementStyleAction,
  addOrUpdateElementAttribute,
  spaceMediaChangedAction,
  currentSpaceElementChangedAction,
  addElementToGroupAction,
  removeElementFromGroupAction,
  rebuildSpaceAction,
  groupElementsAction,
  unGroupElementsAction,
  unGroupElementsFinishedAction as unGroupElementsFinishedAction,
  getOutFromGroupAction,
  getIntoGroupAction,
} from './actions';
import { StylesCompileDependency } from '@angular/compiler';

//#region Store State

export enum AppendTo {
  Root = 1,
  CurrentSpaceElement = 2,
}

export class CustomElement {
  constructor(
    public id: string,
    public htmlCode: string,
    public appendTo: string = '<root/>',
    public styles: KeyValuePairModel[] = [],
    public attributes: KeyValuePairModel[] = [],
    public isElGroupRoot: boolean = false,
    public orderNumber: number | 'new' = 'new'
  ) {}

  public static isRootElement(el: CustomElement) {
    return el.appendTo === '<root/>';
  }

  public static get rootElementId() {
    return 'root-element';
  }
}

export class NewCustomElement extends CustomElement {
  constructor(
    public id: string,
    public htmlCode: string,
    public styles: KeyValuePairModel[] = [],
    public attributes: KeyValuePairModel[] = [],
    public isElGroupRoot: boolean = false,
    public orderNumber: number | 'new' = 'new'
  ) {
    super(
      id,
      htmlCode,
      AppendTo.CurrentSpaceElement.toString(),
      styles,
      attributes,
      isElGroupRoot,
      orderNumber
    );
  }
}

export class CustomElementStyleChange {
  constructor(
    public readonly elId: string,
    public changedStyles: KeyValuePairModel[]
  ) {}
}

export class CustomElementAttributeChange {
  constructor(
    public readonly elId: string,
    public changedAttributes: KeyValuePairModel[]
  ) {}
}

export class CustomElementsState {
  constructor(
    public elements: CustomElement[],
    public currentSpaceMedia: string,
    public groupingElements: CustomElement[],
    public lastAddedElement?: CustomElement,
    public lastElementStyleChanged?: CustomElementStyleChange,
    public lastElementAttributeChanged?: CustomElementAttributeChange,
    public selectedElement?: CustomElement,
    public currentSpaceElement?: CustomElement
  ) {}
}

export enum SpaceMedia {
  None = 0,
  Desktop = 1,
  Laptop = 2,
  Tablet = 3,
  Phone = 4,
}

export const initialState: CustomElementsState = {
  elements: [],
  currentSpaceMedia: SpaceMedia[SpaceMedia.None],
  groupingElements: [],
  lastAddedElement: undefined,
  lastElementStyleChanged: undefined,
  lastElementAttributeChanged: undefined,
  selectedElement: undefined,
  currentSpaceElement: undefined,
};

//#endregion

export const customElementsReducer = createReducer(
  initialState,
  on(addCustomElementAction, (state, customElement) => {
    const positionStyle = customElement.styles.find(
      (x) => x.name === 'position'
    );

    if (!positionStyle) {
      customElement = {
        ...customElement,
        styles: [
          ...customElement.styles,
          { name: 'position', value: 'relative' },
        ],
        appendTo:
          customElement.appendTo === AppendTo.CurrentSpaceElement.toString()
            ? state.currentSpaceElement!.id
            : customElement.appendTo,
      };
    }

    const orderNumber =
      customElement.orderNumber === 'new'
        ? state.lastAddedElement
          ? <number>state.lastAddedElement.orderNumber + 1
          : 0
        : customElement.orderNumber;

    let styles = [...(customElement.styles ?? [])];
    addStyle(
      styles,
      [
        { name: 'display', value: 'flex' },
        { name: 'order', value: orderNumber.toString() },
      ],
      true
    );

    customElement = {
      ...customElement,
      orderNumber,
      styles,
    };

    const elements = [...state.elements];
    elements.push(customElement);

    const currentSpaceElement =
      !state.currentSpaceElement && CustomElement.isRootElement(customElement)
        ? customElement
        : state.currentSpaceElement;

    return {
      ...state,
      elements: elements,
      lastAddedElement: customElement,
      currentSpaceElement,
    };
  }),
  on(removeCustomElementAction, (state, { element }) => {
    const els = [...state.elements];
    const findEl = els.find((x) => x.id === element.id);

    if (findEl) {
      const index = els.indexOf(findEl);
      els.splice(index, 1);
    }

    return { ...state, elements: els };
  }),
  on(setSelectedElementAction, (state, prop) => {
    const el = state.elements.find((x) => x.id === prop.elId);

    return { ...state, selectedElement: el };
  }),
  on(addOrUpdateElementStyleAction, (state, prop) => {
    const element = state.elements.find((x) => x.id === prop.elId);

    if (!element) return { ...state };

    var elements = [...state.elements];
    var elIndex = elements.indexOf(element);
    elements.splice(elIndex, 1);
    const newEl = { ...element };
    elements.push(newEl);

    let currentStyles = [...(newEl.styles ?? [])];
    addStyle(currentStyles, prop.styles, true);

    // newEl.styles = [...currentStyles, ...prop.styles];
    newEl.styles = [...currentStyles];

    return {
      ...state,
      elements,
      lastElementStyleChanged: { elId: prop.elId, changedStyles: prop.styles },
    };
  }),
  on(addOrUpdateElementAttribute, (state, prop) => {
    return { ...state };
  }),
  on(spaceMediaChangedAction, (state, prop) => {
    return {
      ...state,
      currentSpaceMedia: prop.media,
    };
  }),
  on(currentSpaceElementChangedAction, (state, prop) => {
    return {
      ...state,
      currentSpaceElement: prop.spaceElement,
    };
  }),
  on(addElementToGroupAction, (state, prop) => {
    const el = state.elements.find((x) => x.id === prop.elId);

    if (!el || state.groupingElements?.find((x) => x.id === prop.elId))
      return { ...state };

    const groupingElements = [...(state.groupingElements ?? []), el];

    return {
      ...state,
      groupingElements,
    };
  }),
  on(removeElementFromGroupAction, (state, prop) => {
    const existsEl = state.groupingElements?.find((x) => x.id === prop.elId);

    if (!existsEl) return { ...state };

    const groupingElements = [...(state.groupingElements ?? [])];

    const index = groupingElements.indexOf(existsEl);
    groupingElements.splice(index, 1);

    return {
      ...state,
      groupingElements,
    };
  }),
  on(rebuildSpaceAction, (state) => {
    return {
      ...state,
      selectedElement: undefined,
      lastAddedElement: undefined,
      lastElementAttributeChanged: undefined,
      lastElementStyleChanged: undefined,
      groupingElements: []
    };
  }),
  on(groupElementsAction, (state) => {
    if (state.groupingElements.length <= 1) return { ...state };

    const groupRootEl = new CustomElement(
      Date.now().toString(),
      'rittry-element',
      state.currentSpaceElement?.id ?? CustomElement.rootElementId,
      [{ name: 'position', value: 'relative' }],
      [],
      true
    );

    const elements = [
      ...state.elements.filter((x) =>
        state.groupingElements.every((y) => y.id !== x.id)
      ),
      groupRootEl,
    ];

    state.groupingElements.forEach((el) => {
      const styles = el.styles.filter(
        (s) => s.name !== 'top' && s.name !== 'left' && s.name !== 'position'
      );

      styles.push({ name: 'position', value: 'relative' });

      const newEl = {
        ...el,
        appendTo: groupRootEl.id,
        styles,
      };

      elements.push(newEl);
    });

    return {
      ...state,
      elements,
      groupingElements: [],
      selectedElement: undefined,
      currentSpaceElement: groupRootEl,
    };
  }),
  on(getOutFromGroupAction, (state, prop) => {
    const groupEl = state.elements.find((x) => x.id === prop.groupElId)!;
    const parentGroupEl = state.elements.find((x) => x.id === groupEl.appendTo);

    if (
      !parentGroupEl ||
      (!parentGroupEl.isElGroupRoot &&
        !CustomElement.isRootElement(parentGroupEl))
    )
      return { ...state };

    return {
      ...state,
      currentSpaceElement: parentGroupEl,
    };
  }),
  on(getIntoGroupAction, (state, prop) => {
    const groupEl = state.elements.find((x) => x.id === prop.groupElId)!;

    if (!groupEl.isElGroupRoot) return { ...state };

    // if (!parentGroupEl || (!parentGroupEl.isElGroupRoot && !CustomElement.isRootElement(parentGroupEl))) return {...state};

    return {
      ...state,
      currentSpaceElement: groupEl,
    };
  }),
  on(unGroupElementsAction, (state, prop) => {
    return { ...state };
  }),
  on(unGroupElementsFinishedAction, (state, prop) => {
    const groupRootEl = state.elements.find((x) => x.id === prop.groupElId)!;
    const parentRootEl = state.elements.find(
      (x) => x.id === groupRootEl.appendTo
    )!;

    const groupEls = state.elements.filter(
      (x) => x.appendTo === prop.groupElId
    );

    const elements = [
      ...state.elements.filter(
        (x) => groupEls.every((y) => y.id !== x.id) && x.id !== prop.groupElId
      ),
    ];

    groupEls.forEach((el) => {
      const newEl = {
        ...el,
        appendTo: groupRootEl.appendTo,
      };

      elements.push(newEl);
    });

    return {
      ...state,
      elements,
      groupingElements: [],
      selectedElement: undefined,
      currentSpaceElement: parentRootEl,
    };
  })
);

//#region Helpers
function addStyle(
  fromStyles: KeyValuePairModel[],
  styles: KeyValuePairModel[],
  force = false
) {
  styles.forEach((style) => {
    const currentStyle = fromStyles.find((x) => x.name === style.name);

    if (currentStyle && force) {
      const index = fromStyles.indexOf(currentStyle);
      fromStyles.splice(index, 1);

      if (force) {
        fromStyles.push({ name: style.name, value: style.value });
      }
    } else {
      fromStyles.push({ name: style.name, value: style.value });
    }
  });
}
//#region
