import { createAction, createFeatureSelector, createReducer, createSelector, on, props } from '@ngrx/store';

export class CustomElementStyle {
  constructor(public name: string, public value: string) {}
}

export class CustomElement {
  constructor(
    public htmlCode: string,
    public uid: string,
    public appendTo: string = '<root/>',
    public style: CustomElementStyle[] = []
  ) {}
}

export class CustomElementsState {
  constructor(public customElements: CustomElement[]) {}
}

export const initialState: CustomElementsState = {
  customElements: []
};

export const addCustomElementAction = createAction(
  'Add custom element',
  props<CustomElement>()
);

//#region Selectors

export const uiElementEditorFeatureSelector = createFeatureSelector<any, any>('updateComponentFeature');

export const addUiElementSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.customElements.length > 0
  ? state.customElements[state.customElements.length - 1]
  : undefined);

//#endregion

export const customElementsReducer = createReducer(
  initialState,
  on(addCustomElementAction, (state, customElement) => {
    const elements: CustomElement[] = [];
    elements.push(customElement);

    // customElement.style.forEach(prop => {
    //   const currentProp = elements.length > 0 ? elements[0].style.find(x => x.name == prop.name) : null;

    //   if (currentProp) {
    //     currentProp.value = prop.value;
    //   }
    //   else {
    //     elements.push(customElement);
    //     elements[0].style.push(prop);
    //   }
    // });

    return {...state, customElements: elements};
  })
);
