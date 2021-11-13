import {
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props,
} from '@ngrx/store';
import { KeyValuePairModel } from '../models/key-value-pair.model';

export class CustomElement {
  constructor(
    public id: string,
    public htmlCode: string,
    public appendTo: string = '<root/>',
    public styles: KeyValuePairModel[] = [],
    public attributes: KeyValuePairModel[] = []
  ) {}

  public static isRootElement(el: CustomElement) {
    return el.appendTo === '<root/>';
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
  lastAddedElement: undefined,
  lastElementStyleChanged: undefined,
  lastElementAttributeChanged: undefined,
  selectedElement: undefined,
  currentSpaceElement: undefined,
};

export const addCustomElementAction = createAction(
  'Add custom element',
  props<CustomElement>()
);

export const removeCustomElementAction = createAction(
  'Remove custom element',
  props<{ element: CustomElement; fromStorage: boolean }>()
);

export const addOrUpdateElementStyle = createAction(
  'Add or update custom element style',
  props<{ elId: string; styles: KeyValuePairModel[] }>()
);

export const addOrUpdateElementAttribute = createAction(
  'Add or update custom element attribute',
  props<{ elId: string; attributes: KeyValuePairModel[] }>()
);

export const spaceSelectElementAction = createAction(
  'Select custom element on space',
  props<CustomElement>()
);

export const changingSpaceMediaAction = createAction(
  'Start changing space media',
  props<{ media: string }>()
);

export const changedSpaceMediaAction = createAction(
  'Space media changed',
  props<{ media: string }>()
);

//#region Selectors

export const uiElementEditorFeatureSelector = createFeatureSelector<any, any>(
  'updateComponentFeature'
);

export const addUiElementSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.lastAddedElement
);

export const lastElementStyleChangedSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.lastElementStyleChanged
);

export const elementsSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.elements
);

export const changeStyleElementSelector =  createSelector(
  lastElementStyleChangedSelector,
  elementsSelector,
  (style, els) => {
    if (!style || !els) return undefined;

    return {
      el: els.find((x) => x.id === style.elId)!,
      changedStyles: style.changedStyles,
    };
  }
);

export const changeAttributeElementSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.lastElementAttributeChanged,
  (state: CustomElementsState, lastElementAttributeChanged) => {
    if (!lastElementAttributeChanged) return undefined;

    return {
      el: state.elements.find((x) => x.id === lastElementAttributeChanged.elId)!,
      changedAttributes: lastElementAttributeChanged.changedAttributes,
    };
  }
);

export const selectedElementSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.selectedElement
)

export const changeSpaceMediaSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.currentSpaceMedia
);

//#endregion

export const customElementsReducer = createReducer(
  initialState,
  on(addCustomElementAction, (state, customElement) => {
    const elements = [...state.elements];
    elements.push(customElement);

    return { ...state, elements: elements, lastAddedElement: customElement };
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
  on(spaceSelectElementAction, (state, spaceSelectedElement) => {
    return { ...state, selectedElement: spaceSelectedElement };
  }),
  on(addOrUpdateElementStyle, (state, prop) => {
    const element = state.elements.find((x) => x.id === prop.elId);

    if (!element) return { ...state };

    var elements = [...state.elements];
    var elIndex = elements.indexOf(element);
    elements.splice(elIndex, 1);
    const newEl = { ...element };
    elements.push(newEl);

    let currentStyles = [...(newEl.styles ?? [])];
    prop.styles.forEach((style) => {
      const currentStyle = currentStyles.find((x) => x.name === style.name);

      if (currentStyle) {
        const index = currentStyles.indexOf(currentStyle);
        currentStyles.splice(index, 1);
      }
    });

    newEl.styles = [...currentStyles, ...prop.styles];

    return {
      ...state,
      elements,
      lastElementStyleChanged: { elId: prop.elId, changedStyles: prop.styles }
    };
  }),
  on(addOrUpdateElementAttribute, (state, prop) => {
    return { ...state };
  }),
  on(changedSpaceMediaAction, (state, prop) => {
    return {
      ...state,
      currentSpaceMedia: prop.media,
    };
  })
);
