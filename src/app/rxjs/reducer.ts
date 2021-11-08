import {
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props,
} from '@ngrx/store';
import { KeyValuePair } from '../models/key-value-pair';

export class CustomElement {
  constructor(
    public htmlCode: string,
    public uid: string,
    public appendTo: string = '<root/>'
  ) {}
}

export class CustomElementStyle {
  constructor(
    public readonly uid: string,
    public values: KeyValuePair[] = []
  ) {}
}

export class CustomElementStyleChange {
  constructor(
    public readonly uid: string,
    public allStyles: KeyValuePair[],
    public changedStyles: KeyValuePair[]
  ) {}
}

export class CustomElementAttribute {
  constructor(
    public readonly uid: string,
    public values: KeyValuePair[] = []
  ) {}
}

export class CustomElementsState {
  constructor(
    public elements: CustomElement[],
    public elementStyles: CustomElementStyle[],
    public elementAttributes: CustomElementAttribute[],
    public currentSpaceMedia: string,
    public lastElementStyleChanged?: CustomElementStyleChange,
    public lastElementAttributeChanged?: CustomElementAttribute,
    public selectedElement?: CustomElement,
    public currentSpaceElement?: CustomElement
  ) {}
}

export enum SpaceMedia {
  Desktop = 1,
  Laptop = 2,
  Tablet = 3,
  Phone = 4,
}

export const initialState: CustomElementsState = {
  elements: [],
  elementStyles: [],
  elementAttributes: [],
  currentSpaceMedia: SpaceMedia[SpaceMedia.Desktop],
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
  props<CustomElementStyle>()
);

export const addOrUpdateElementAttribute = createAction(
  'Add or update custom element attribute',
  props<CustomElementAttribute>()
);

export const spaceSelectElementAction = createAction(
  'Select custom element on space',
  props<CustomElement>()
);

export const changingSpaceMediaAction = createAction(
  'Start changing space media',
  props<{ fromMedia: string; toMedia: string }>()
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
  (state: CustomElementsState) =>
    state.elements.length > 0
      ? state.elements[state.elements.length - 1]
      : undefined
);

export const changeStyleElementSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.lastElementStyleChanged
);

export const changeAttributeElementSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.lastElementAttributeChanged
);

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

    return { ...state, elements: elements };
  }),
  on(removeCustomElementAction, (state, { element }) => {
    const els = [...state.elements];
    const findEl = els.find((x) => x.uid === element.uid);

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
    let elementStyle = state.elementStyles.find((x) => x.uid === prop.uid);

    let elementStyles = [...state.elementStyles];
    if (elementStyle) {
      const index = elementStyles.indexOf(elementStyle);
      elementStyles.splice(index, 1);
    }

    let currentStyles = [...(elementStyle?.values ?? [])];
    prop.values.forEach((style) => {
      const currentStyle = currentStyles.find((x) => x.name === style.name);

      if (currentStyle) {
        const index = currentStyles.indexOf(currentStyle);
        currentStyles.splice(index, 1);
      }
    });

    const newElementStyle = {
      uid: prop.uid,
      values: [...(currentStyles ?? []), ...prop.values],
    };

    elementStyles.push(newElementStyle);

    return {
      ...state,
      elementStyles,
      lastElementStyleChanged: {
        uid: prop.uid,
        allStyles: newElementStyle.values,
        changedStyles: prop.values,
      },
    };
  }),
  on(addOrUpdateElementAttribute, (state, prop) => {
    let elementAttribute = state.elementAttributes.find(
      (x) => x.uid === prop.uid
    );

    let elementAttributes = [...state.elementAttributes];
    if (elementAttribute) {
      const index = elementAttributes.indexOf(elementAttribute);
      elementAttributes.splice(index, 1);
    }

    const newElementAttribute = {
      uid: prop.uid,
      values: [...(elementAttribute?.values ?? []), ...prop.values],
    };

    elementAttributes.push(newElementAttribute);

    return {
      ...state,
      elementAttributes,
      lastElementAttributeChanged: newElementAttribute,
    };
  }),
  on(changedSpaceMediaAction, (state, prop) => {
    return {
      ...state,
      currentSpaceMedia: prop.media,
    };
  })
);
