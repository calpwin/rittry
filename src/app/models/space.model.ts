import { CustomElementModel } from './custom-element.model';

export class SpaceModel {
  constructor(public spaces: { [media: string]: CustomElementModel[] }) {}
}
