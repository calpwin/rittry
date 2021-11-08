import {
  addCustomElementAction,
  addOrUpdateElementAttribute,
  addOrUpdateElementStyle,
  changeAttributeElementSelector,
  changeSpaceMediaSelector,
  changeStyleElementSelector,
  CustomElement,
  CustomElementAttribute,
  CustomElementStyle,
  CustomElementStyleChange,
  SpaceMedia,
} from './../rxjs/reducer';
import { Store } from '@ngrx/store';
import { CustomElementModel } from './../models/custom-element.model';
import { Injectable } from '@angular/core';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class CustomElementRepository {
  private _elements: CustomElementModel[] = [];
  private _currentMedia: string = SpaceMedia[SpaceMedia.Desktop];

  public get currentMedia() {
    return this._currentMedia;
  }

  constructor(
    private readonly _store: Store<any>,
    private readonly _localStorageService: LocalStorageService
  ) {
    _store.select(changeSpaceMediaSelector).subscribe((media) => {
      this._currentMedia = media;
    });

    _store.select(changeStyleElementSelector).subscribe((style) => {
      if (!style) return;

      this.changeElementStyle(style);
    });

    _store.select(changeAttributeElementSelector).subscribe((attribute) => {
      if (!attribute) return;

      this.changeElementAttribute(attribute);
    });
  }

  public addRootElement() {
    if (this._elements.find((x) => x.isRootElement)) return;

    const rootEl = new CustomElementModel(
      'rittry-layout',
      'rt6945ef-ff6b-4671-bc5c-a4371a7743f6',
      '<root/>'
    );

    this.addElement(rootEl);
  }

  public addElement(element: CustomElementModel) {
    if (this._elements.find((x) => x.uid === element.uid)) return;

    this._elements.push(element);

    this._localStorageService.saveSpaceModel(this._elements);

    const customElement = new CustomElement(
      element.htmlCode,
      element.uid,
      element.appendTo
    );

    this._store.dispatch(addCustomElementAction(customElement));

    this._store.dispatch(
      addOrUpdateElementStyle({
        uid: element.uid,
        values: element.styles,
      })
    );

    this._store.dispatch(
      addOrUpdateElementAttribute({
        uid: element.uid,
        values: element.attributes,
      })
    );
  }

  public getElement(uid: string) {
    return this._elements.find((x) => x.uid === uid);
  }

  public getAllElements() {
    return this._elements;
  }

  public removeElement(uid: string, fromStorage = true) {
    const el = this._elements.find((x) => x.uid === uid);

    if (!el) return;

    const index = this._elements.indexOf(el);
    this._elements.splice(index, 1);

    if (fromStorage) this._localStorageService.saveSpaceModel(this._elements);
  }

  private changeElementStyle(style: CustomElementStyleChange) {
    const el = this._elements.find((x) => x.uid === style.uid);

    if (!el) return;

    el.styles = style.allStyles;

    this._localStorageService.saveSpaceModel(this._elements);
  }

  private changeElementAttribute(attribute: CustomElementAttribute) {
    const el = this._elements.find((x) => x.uid === attribute.uid);

    if (!el) return;

    el.attributes = attribute.values;

    this._localStorageService.saveSpaceModel(this._elements);
  }
}
function take(arg0: number): import('rxjs').OperatorFunction<any, unknown> {
  throw new Error('Function not implemented.');
}
