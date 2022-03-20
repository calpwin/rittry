import {
  CustomElement,
  SpaceMedia,
} from './../rxjs/reducer';
import { Injectable } from '@angular/core';
import { SpaceModel } from '../models/space.model';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly _localStorageKey: string = 'custom-elements';

  constructor() {}

  public saveSpaceModel(elements: CustomElement[], media: string) {
    let spaceModel = this.getSpaceModel();

    // elements = elements.filter((x) => x.appendTo !== '<root/>');

    elements = this.arrangeElements(elements);

    if (!spaceModel)
      spaceModel = new SpaceModel({
        [this.getSpaceMediaSize(media)]: [],
      });

    spaceModel.spaces[this.getSpaceMediaSize(media)] = elements;

    localStorage.setItem(this._localStorageKey, JSON.stringify(spaceModel));
  }

  public getCurrentMediaElemetModels(
    media: string
  ): CustomElement[] | undefined {
    const spaceModel = this.getSpaceModel();

    const mediaStrs = spaceModel?.spaces;

    if (!mediaStrs) return undefined;

    let elements: CustomElement[] | undefined =
      spaceModel?.spaces[this.getSpaceMediaSize(media)];

    if (elements) return elements;

    const medias = Object.keys(mediaStrs)
      .map((x) => parseInt(x, 10))
      .filter((x) => x > parseInt(this.getSpaceMediaSize(media), 10))
      .sort((a, b) => (a > b ? 1 : -1));

    for (let media of medias) {
      elements = spaceModel?.spaces[media + 'px'];

      if (elements) break;
    }

    return elements;
  }

  public getSpaceModel(): SpaceModel | undefined {
    const json = localStorage.getItem(this._localStorageKey);

    if (!json) return undefined;

    const spaceModel: SpaceModel = JSON.parse(json);

    if (!spaceModel?.spaces) return undefined;

    return spaceModel;
  }

  public getSpaceMediaSize(media: string) {
    switch (media) {
      case SpaceMedia[SpaceMedia.Phone]:
        return '480px';
      case SpaceMedia[SpaceMedia.Tablet]:
        return '768px';
      case SpaceMedia[SpaceMedia.Laptop]:
        return '1024px';
      case SpaceMedia[SpaceMedia.Desktop]:
        return '1200px';
      default:
        return media;
    }
  }

  private arrangeElements(elements: CustomElement[]): CustomElement[] {
    const els: CustomElement[] = [];

    for (const el of elements) {
      const parentEl = els.find((x) => x.id === el.appendTo);

      if (parentEl) {
        const index = els.indexOf(parentEl);
        els.splice(index + 1, 0, el);
      } else {
        els.splice(0, 0, el);
      }
    }

    return els;
  }
}
