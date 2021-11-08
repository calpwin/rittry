import {
  changeSpaceMediaSelector,
  CustomElementsState,
  SpaceMedia,
} from './../rxjs/reducer';
import { Injectable } from '@angular/core';
import { CustomElementModel } from '../models/custom-element.model';
import { SpaceModel } from '../models/space.model';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly _localStorageKey: string = 'custom-elements';
  private _media: string = SpaceMedia[SpaceMedia.Desktop];

  constructor(private readonly _store: Store<CustomElementsState>) {
    _store
      .select(changeSpaceMediaSelector)
      .subscribe((media) => (this._media = media));
  }

  public saveSpaceModel(models: CustomElementModel[]) {
    let spaceModel = this.getSpaceModel();

    if (!spaceModel)
      spaceModel = new SpaceModel({
        [this.getSpaceMediaSize(this._media)]: [],
      });

    spaceModel.spaces[this.getSpaceMediaSize(this._media)] = models;

    localStorage.setItem(this._localStorageKey, JSON.stringify(spaceModel));
  }

  public getCurrentMediaElemetModels(): CustomElementModel[] | undefined {
    const spaceModel = this.getSpaceModel();

    const mediaStrs = spaceModel?.spaces;

    if (!mediaStrs) return undefined;

    let elements: CustomElementModel[] | undefined =
      spaceModel?.spaces[this.getSpaceMediaSize(this._media)];

    if (elements) return elements;

    const medias = Object.keys(mediaStrs)
      .map((x) => parseInt(x, 10))
      .filter(x => x > parseInt(this.getSpaceMediaSize(this._media), 10))
      .sort((a,b) => (a > b ? 1 : -1));

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
}
