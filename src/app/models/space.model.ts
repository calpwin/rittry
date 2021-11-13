import { CustomElement } from "../rxjs/reducer";

export class SpaceModel {
  constructor(public spaces: { [media: string]: CustomElement[] }) {}
}
