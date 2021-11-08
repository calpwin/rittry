import { CustomElementModel } from './../models/custom-element.model';
import Moveable from 'moveable';

export class CustomMovableElement {
  constructor(
    public readonly customElementModel: CustomElementModel,
    public readonly movableElement: HTMLElement,
    public movable?: Moveable,
    closeBtnElement: HTMLElement | undefined = undefined
  ) {
    this._closeBtnElement = closeBtnElement;
  }

  private _closeBtnElement: HTMLElement | undefined;
  public get closeBtnElement() {
    return this._closeBtnElement;
  }

  public setCloseBtnElement(el: HTMLElement) {
    this._closeBtnElement = el;
  }
}
