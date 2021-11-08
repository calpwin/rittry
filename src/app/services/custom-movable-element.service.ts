import { KeyValuePair } from './../models/key-value-pair';
import {
  addUiElementSelector,
  spaceSelectElementAction,
  changeAttributeElementSelector,
  CustomElementStyle,
  changeStyleElementSelector,
  CustomElementAttribute,
  addOrUpdateElementStyle,
  addOrUpdateElementAttribute,
  CustomElementStyleChange,
  SpaceMedia,
} from '../rxjs/reducer';
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Store } from '@ngrx/store';
import Moveable, { MoveableOptions, OnScale } from 'moveable';
import { CustomMovableElement } from './custom-movable-element';
import { CustomElementModel } from '../models/custom-element.model';
import { CustomElementRepository } from '../repositories/custom-element.repository';
import { LocalStorageService } from './local-storage.service';
import { SpaceModel } from '../models/space.model';

@Injectable({
  providedIn: 'root',
})
export class CustomMovableElementService {
  private readonly _renderer: Renderer2;

  private readonly _elements: Map<string, CustomMovableElement> = new Map();

  constructor(
    rendererFactory: RendererFactory2,
    private readonly _store: Store<any>,
    private readonly _customelementRepository: CustomElementRepository,
    private readonly _localStorageService: LocalStorageService
  ) {
    this._renderer = rendererFactory.createRenderer(null, null);
  }

  public initialize() {
    this._store.select(addUiElementSelector).subscribe((el) => {
      if (el) {
        const elModel = this._customelementRepository.getElement(el.uid);
        this.createElement(elModel!);
      }
    });

    this._store.select(changeStyleElementSelector).subscribe((style) => {
      if (style) this.changeElementStyles(style);
    });

    this._store
      .select(changeAttributeElementSelector)
      .subscribe((attribute) => {
        if (attribute) this.changeElementAttributes(attribute);
      });
  }

  public recreateFromStorage(media: SpaceMedia | string) {
    const elements = this._localStorageService.getCurrentMediaElemetModels();

    this._customelementRepository.addRootElement();

    if (!elements) return;

    elements.forEach((el) =>
      this._customelementRepository.addElement(el)
    );
  }

  public createElement(element: CustomElementModel) {
    if (!element) return;

    if (this._elements.has(element.uid)) {
      console.log(`Already exists element with uid: ${element.uid}`);

      return;
    }

    const appendEl = document.createElement(element.htmlCode);

    let appendToEl;
    if (element.appendTo === '<root/>') {
      appendToEl = document.querySelector('.append-custom-el-to');
    } else {
      appendToEl = this._elements.get(element.appendTo)?.movableElement;
    }

    if (!appendToEl) {
      console.log('Append element to not found will set to root space');
      return;
    }

    appendToEl.append(appendEl);

    this._renderer.setAttribute(appendEl, 'id', element.uid);
    this._renderer.addClass(appendEl, 'custom-element');

    const elModel = this._customelementRepository.getElement(element.uid);

    if (!elModel) {
      return;
    }

    var styles = [{ name: 'position', value: 'absolute' }, ...elModel.styles];

    styles.forEach((prop) => {
      this._renderer.setStyle(appendEl, prop.name, prop.value);
    });

    let movable: Moveable | undefined = undefined;
    if (!element.isRootElement) {
      movable = this.makeMovable(appendToEl as HTMLElement, appendEl);
    }

    this._elements.set(
      element.uid,
      new CustomMovableElement(element, appendEl, movable)
    );
  }

  public changeElementStyles(style: CustomElementStyleChange) {
    const el = this._elements.get(style.uid);

    if (!el) return;

    style.changedStyles.forEach((prop) => {
      this._renderer.setStyle(el.movableElement, prop.name, prop.value);
    });

    const positionStyle = style.changedStyles.find(
      (x) => x.name === 'position'
    );

    if (el.movable && positionStyle?.value === 'relative') {
      const container = el.movable.container as HTMLElement;
      el.movable.destroy();

      const clearPositionStyles = [
        { name: 'left', value: '0' },
        { name: 'top', value: '0' },
      ];
      clearPositionStyles.forEach((prop) => {
        this._renderer.setStyle(el.movableElement, prop.name, prop.value);
      });

      el.movable = this.makeMovable(container, el.movableElement, {
        draggable: false,
      });

      this._store.dispatch(
        addOrUpdateElementStyle({
          uid: el.customElementModel.uid,
          values: clearPositionStyles,
        })
      );
    } else if (el.movable && positionStyle?.value === 'absolute') {
      const container = el.movable.container as HTMLElement;
      el.movable.destroy();

      el.movable = this.makeMovable(container, el.movableElement);
    }
  }

  public changeElementAttributes(attribute: CustomElementAttribute) {
    const el = this._elements.get(attribute.uid);

    if (!el) return;

    attribute.values.forEach((prop) => {
      this._renderer.setAttribute(el.movableElement, prop.name, prop.value);
    });
  }

  public addOrUpdateStyle(style: { uid: string; values: KeyValuePair[] }) {
    this._store.dispatch(addOrUpdateElementStyle(style));
  }

  public addOrUpdateAttribute(attribute: CustomElementAttribute) {
    this._store.dispatch(addOrUpdateElementAttribute(attribute));
  }

  public removeElement(element: CustomMovableElement) {
    if (!this._elements.has(element.customElementModel.uid)) return;

    let appendToEl = document.querySelector(
      !element.customElementModel.isRootElement ? element.customElementModel.appendTo : '.append-custom-el-to'
    );

    element.movable?.destroy();
    this._renderer.removeChild(appendToEl, element.movableElement);

    this._elements.delete(element.customElementModel.uid);
    // this._customelementRepository.removeElement(element.customElementModel.uid);
  }

  public getElement(uid: string) {
    if (!this._elements.has(uid)) return undefined;

    return this._elements.get(uid);
  }

  public getAllElements() {
    return this._elements;
  }

  public addCloseBtn(el: HTMLElement) {}

  private makeMovable(
    parentElement: HTMLElement,
    movableElement: HTMLElement,
    options?: MoveableOptions
  ) {
    const moveable = new Moveable(parentElement, {
      ...{
        target: movableElement,
        // If the container is null, the position is fixed. (default: parentElement(document.body))
        container: parentElement,
        draggable: true,
        resizable: true,
        scalable: true,
        rotatable: true,
        warpable: true,
        // Enabling pinchable lets you use events that
        // can be used in draggable, resizable, scalable, and rotateable.
        pinchable: true, // ["resizable", "scalable", "rotatable"]
        origin: true,
        keepRatio: false,
        // Resize, Scale Events at edges.
        edge: false,
        throttleDrag: 0,
        throttleResize: 0,
        throttleScale: 0,
        throttleRotate: 0,
        dragArea: true,
      },
      ...options,
    });

    let frame = {
      translate: [0, 0],
    };

    /* draggable */
    moveable
      .on('click', ({ target }) => {
        const uid = target!.getAttribute('id');

        if (!uid) return;

        const element = this.getElement(uid)!;
        this._store.dispatch(
          spaceSelectElementAction(element.customElementModel)
        );
      })
      .on('dragStart', ({ target, clientX, clientY }) => {
        // console.log('onDragStart', target);
      })
      .on(
        'drag',
        ({
          target,
          transform,
          left,
          top,
          right,
          bottom,
          beforeDelta,
          beforeDist,
          delta,
          dist,
          clientX,
          clientY,
        }) => {
          // target!.style.left = `${left}px`;
          // target!.style.top = `${top}px`;

          const uid = target!.getAttribute('id');

          if (uid) {
            this.addOrUpdateStyle({
              uid,
              values: [
                { name: 'left', value: `${left}px` },
                { name: 'top', value: `${top}px` },
              ],
            });
          }
        }
      )
      .on('dragEnd', ({ target, isDrag, clientX, clientY }) => {
        // console.log('onDragEnd', target, isDrag);
      });

    /* resizable */
    moveable
      .on('resizeStart', ({ target, clientX, clientY }) => {
        // console.log('onResizeStart', target);
      })
      .on(
        'resize',
        ({ target, width, height, dist, delta, clientX, clientY }) => {
          // console.log('onResize', target);
          // delta[0] && (target!.style.width = `${width}px`);
          // delta[1] && (target!.style.height = `${height}px`);

          const uid = target!.getAttribute('id');
          if (uid) {
            this.addOrUpdateStyle({
              uid,
              values: [
                { name: 'width', value: `${width}px` },
                { name: 'height', value: `${height}px` },
              ],
            });
          }
        }
      )
      .on('resizeEnd', ({ target, isDrag, clientX, clientY }) => {
        // console.log('onResizeEnd', target, isDrag);
      });

    /* scalable */
    moveable
      .on('scaleStart', ({ target, clientX, clientY }) => {
        // console.log('onScaleStart', target);
      })
      .on(
        'scale',
        ({
          target,
          scale,
          dist,
          delta,
          transform,
          clientX,
          clientY,
        }: OnScale) => {
          // console.log('onScale scale', scale);
          // target!.style.transform = transform;

          const uid = target!.getAttribute('id');
          if (uid) {
            this.addOrUpdateStyle({
              uid,
              values: [{ name: 'transform', value: transform }],
            });
          }
        }
      )
      .on('scaleEnd', ({ target, isDrag, clientX, clientY }) => {
        // console.log('onScaleEnd', target, isDrag);
      });

    /* rotatable */
    moveable
      .on('rotateStart', ({ target, clientX, clientY }) => {
        // console.log('onRotateStart', target);
      })
      .on(
        'rotate',
        ({ target, beforeDelta, delta, dist, transform, clientX, clientY }) => {
          // console.log('onRotate', dist);
          // target!.style.transform = transform;

          const uid = target!.getAttribute('id');
          if (uid) {
            this.addOrUpdateStyle({
              uid,
              values: [{ name: 'transform', value: transform }],
            });
          }
        }
      )
      .on('rotateEnd', ({ target, isDrag, clientX, clientY }) => {
        // console.log('onRotateEnd', target, isDrag);
      });

    /* warpable */
    let matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    moveable
      .on('warpStart', ({ target, clientX, clientY }) => {
        // console.log('onWarpStart', target);
      })
      .on(
        'warp',
        ({ target, clientX, clientY, delta, dist, multiply, transform }) => {
          // console.log('onWarp', target);
          // target.style.transform = transform;
          matrix = multiply(matrix, delta);
          target.style.transform = `matrix3d(${matrix.join(',')})`;
        }
      )
      .on('warpEnd', ({ target, isDrag, clientX, clientY }) => {
        // console.log('onWarpEnd', target, isDrag);
      });

    return moveable;
  }
}
