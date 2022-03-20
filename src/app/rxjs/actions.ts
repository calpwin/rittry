import { createAction, props } from "@ngrx/store";
import { KeyValuePairModel } from "../models/key-value-pair.model";
import { CustomElement, NewCustomElement } from "./reducer";

export const addCustomElementAction = createAction(
  'Add custom element',
  props<CustomElement | NewCustomElement>()
);

export const removeCustomElementAction = createAction(
  'Remove custom element',
  props<{ element: CustomElement; fromStorage: boolean }>()
);

export const addOrUpdateElementStyleAction = createAction(
  'Add or update custom element style',
  props<{ elId: string; styles: KeyValuePairModel[] }>()
);

export const addOrUpdateElementAttribute = createAction(
  'Add or update custom element attribute',
  props<{ elId: string; attributes: KeyValuePairModel[] }>()
);

export const setSelectedElementAction = createAction(
  'Select custom element on space',
  props<{elId: string | undefined}>()
);

export const startChangeSpaceMediaAction = createAction(
  'Start changing space media',
  props<{ media: string }>()
);

export const spaceMediaChangedAction = createAction(
  'Space media changed',
  props<{ media: string }>()
);

export const currentSpaceElementChangedAction = createAction(
  'Change current space element',
  props<{ spaceElement: CustomElement }>()
);

export const groupElementsAction = createAction(
  'Group elements',
);

export const addElementToGroupAction = createAction(
  'Add element to group',
  props<{ elId: string }>()
);

export const removeElementFromGroupAction = createAction(
  'Remove element from group',
  props<{ elId: string }>()
);

export const unGroupElementsAction = createAction(
  'Ungroup elements',
  props<{ groupElId: string }>()
);

export const unGroupElementsFinishedAction = createAction(
  'Remove elements from group finished',
  props<{ groupElId: string }>()
);

export const getOutFromGroupAction = createAction(
  'Get out from elements group to parent root space',
  props<{ groupElId: string }>()
);

export const getIntoGroupAction = createAction(
  'Get into elemtns group from root space',
  props<{ groupElId: string }>()
);

export const rebuildSpaceAction = createAction(
  'Rebuild currrent elements space'
);
