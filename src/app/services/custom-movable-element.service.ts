import { KeyValuePairModel } from '../models/key-value-pair.model';
import {
  addUiElementSelector,
  spaceSelectElementAction,
  changeAttributeElementSelector,
  changeStyleElementSelector,
  addOrUpdateElementStyle,
  addOrUpdateElementAttribute,
  SpaceMedia,
  addCustomElementAction,
  CustomElement,
  elementsSelector,
  lastElementStyleChangedSelector,
} from '../rxjs/reducer';
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Store } from '@ngrx/store';
import Moveable, { MoveableOptions, OnScale } from 'moveable';
import { CustomMovableElement } from './custom-movable-element';
import { LocalStorageService } from './local-storage.service';
import { withLatestFrom } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CustomMovableElementService {
  private readonly _renderer: Renderer2;

  private readonly _elements: Map<string, CustomMovableElement> = new Map();

  constructor(
    rendererFactory: RendererFactory2,
    private readonly _store: Store<any>,
    private readonly _localStorageService: LocalStorageService
  ) {
    this._renderer = rendererFactory.createRenderer(null, null);
  }

  public initialize() {
    this._store.select(addUiElementSelector).subscribe((el) => {
      if (el) {
        this.createElement(el);
      }
    });

    this._store
      .select(lastElementStyleChangedSelector)
      .pipe(withLatestFrom(this._store.select(elementsSelector)))
      .subscribe(([style, els]) => {
        if (!style || !els) return;

        this.changeElementStyles({
          el: els.find((x) => x.id === style.elId)!,
          styles: style.changedStyles,
        });
      });

    // this._store.select(changeStyleElementSelector).subscribe((changes) => {
    //   if (changes)
    //     this.changeElementStyles({
    //       el: changes.el,
    //       styles: changes.changedStyles,
    //     });
    // });

    this._store.select(changeAttributeElementSelector).subscribe((changes) => {
      if (changes)
        this.changeElementAttributes({
          el: changes.el,
          attributes: changes.changedAttributes,
        });
    });
  }

  public recreateFromStorage(media: string) {
    if (!media || media === SpaceMedia[SpaceMedia.None]) return;

    const elements =
      this._localStorageService.getCurrentMediaElemetModels(media);

    // this._customelementRepository.addRootElement();

    this._store.dispatch(
      addCustomElementAction(
        new CustomElement(
          '6945ef-ff6b-4671-bc5c-a4371a7743f6',
          'rittry-layout',
          '<root/>'
        )
      )
    );

    if (!elements) return;

    elements.forEach((el) =>
      this._store.dispatch(
        addCustomElementAction(
          new CustomElement(
            el.id,
            el.htmlCode,
            el.appendTo,
            el.styles,
            el.attributes
          )
        )
      )
    );
  }

  public createElement(element: CustomElement) {
    if (!element) return;

    if (this._elements.has(element.id)) {
      console.log(`Already exists element with uid: ${element.id}`);

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

    this._renderer.setAttribute(appendEl, 'id', element.id);
    this._renderer.addClass(appendEl, 'custom-element');

    var styles = [{ name: 'position', value: 'absolute' }, ...element.styles];

    styles.forEach((prop) => {
      this._renderer.setStyle(appendEl, prop.name, prop.value);
    });

    let movable: Moveable | undefined = undefined;
    if (!CustomElement.isRootElement(element)) {
      movable = this.makeMovable(appendToEl as HTMLElement, appendEl);
    }

    this._elements.set(
      element.id,
      new CustomMovableElement(element, appendEl, movable)
    );
  }

  public changeElementStyles(changes: {
    el: CustomElement;
    styles: KeyValuePairModel[];
  }) {
    const el = this._elements.get(changes.el.id);

    if (!el) return;

    changes.styles.forEach((prop) => {
      this._renderer.setStyle(el.movableElement, prop.name, prop.value);
    });

    const positionStyle = changes.styles.find((x) => x.name === 'position');

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
          elId: el.customElementModel.id,
          styles: clearPositionStyles,
        })
      );
    } else if (el.movable && positionStyle?.value === 'absolute') {
      const container = el.movable.container as HTMLElement;
      el.movable.destroy();

      el.movable = this.makeMovable(container, el.movableElement);
    }
  }

  public changeElementAttributes(changes: {
    el: CustomElement;
    attributes: KeyValuePairModel[];
  }) {
    const el = this._elements.get(changes.el.id);

    if (!el) return;

    changes.attributes.forEach((prop) => {
      this._renderer.setAttribute(el.movableElement, prop.name, prop.value);
    });
  }

  public addOrUpdateStyle(style: { id: string; values: KeyValuePairModel[] }) {
    this._store.dispatch(
      addOrUpdateElementStyle({ elId: style.id, styles: style.values })
    );
  }

  public addOrUpdateAttribute(attribute: {
    id: string;
    values: KeyValuePairModel[];
  }) {
    this._store.dispatch(
      addOrUpdateElementAttribute({
        elId: attribute.id,
        attributes: attribute.values,
      })
    );
  }

  public removeElement(element: CustomMovableElement) {
    if (!this._elements.has(element.customElementModel.id)) return;

    let appendToEl = !CustomElement.isRootElement(element.customElementModel)
      ? document.getElementById(element.customElementModel.appendTo)
      : document.querySelector('.append-custom-el-to');

    element.movable?.destroy();
    this._renderer.removeChild(appendToEl, element.movableElement);

    this._elements.delete(element.customElementModel.id);
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
        const id = target!.getAttribute('id');

        if (!id) return;

        const element = this.getElement(id)!;
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

          const id = target!.getAttribute('id');

          if (id) {
            this.addOrUpdateStyle({
              id,
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

          const id = target!.getAttribute('id');
          if (id) {
            this.addOrUpdateStyle({
              id,
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

          const id = target!.getAttribute('id');
          if (id) {
            this.addOrUpdateStyle({
              id,
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

          const id = target!.getAttribute('id');
          if (id) {
            this.addOrUpdateStyle({
              id,
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
