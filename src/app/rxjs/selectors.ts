import { createFeatureSelector, createSelector } from "@ngrx/store";
import { CustomElementsState } from "./reducer";

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

export const currentSpaceElementSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.currentSpaceElement
);

export const changeAttributeElementSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.lastElementAttributeChanged,
  (state: CustomElementsState, lastElementAttributeChanged) => {
    if (!lastElementAttributeChanged) return undefined;

    return {
      el: state.elements.find(
        (x) => x.id === lastElementAttributeChanged.elId
      )!,
      changedAttributes: lastElementAttributeChanged.changedAttributes,
    };
  }
);

export const selectedElementSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.selectedElement
);

export const currentSpaceMediaSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.currentSpaceMedia
);

export const changeGroupingElementsSelector = createSelector(
  uiElementEditorFeatureSelector,
  (state: CustomElementsState) => state.groupingElements
);
