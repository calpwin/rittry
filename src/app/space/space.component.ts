import {
  changedSpaceMediaAction,
  SpaceMedia,
  changingSpaceMediaAction,
} from './../rxjs/reducer';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { createSelector, State, Store } from '@ngrx/store';
import { SignalRService } from '../hub-connection';
import { CustomMovableElement } from '../services/custom-movable-element';
import { CustomMovableElementService } from '../services/custom-movable-element.service';

import * as Split from 'split.js';
import {
  addOrUpdateElementStyle,
  changeSpaceMediaSelector,
  CustomElement,
  CustomElementsState,
  CustomElementStyle,
  removeCustomElementAction,
  uiElementEditorFeatureSelector,
} from '../rxjs/reducer';
import { KeyValuePair } from '../models/key-value-pair';
import { CustomElementRepository } from '../repositories/custom-element.repository';
import { CustomElementModel } from '../models/custom-element.model';

@Component({
  selector: 'rittry-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss'],
})
export class SpaceComponent implements OnInit, AfterViewInit {
  @ViewChild('mainSpace') _mainSpace!: ElementRef<HTMLElement>;
  @ViewChild('ideWrapper') _ideWrapper!: ElementRef;
  @ViewChild('appendCustomElement')
  _appendCustomElement!: ElementRef<HTMLElement>;

  public selectedElement?: {
    customMovableElement: CustomMovableElement;
    closeBtnElement: HTMLElement;
    position: string;
  };

  constructor(
    private signalRService: SignalRService,
    private readonly _renderer: Renderer2,
    private readonly _elementService: CustomMovableElementService,
    private _store: Store<any>,
    private readonly _state: State<CustomElementsState>,
    private readonly _customElementRepository: CustomElementRepository
  ) {
    _elementService.initialize();
  }

  ngOnInit(): void {
    this.signalRService.startConnection();
    this.signalRService.addTransferChartDataListener();
  }

  ngAfterViewInit(): void {
    this._renderer.setStyle(
      this._mainSpace.nativeElement,
      'width',
      this._mainSpace.nativeElement.getBoundingClientRect().width + 'px'
    );

    const split = (Split as any).default;

    var splitOptions: Split.Options = {
      direction: 'vertical',
      sizes: [60, 40],
      gutterSize: 10,
      minSize: [0, 200],
    };

    // split(
    //   [this._mainSpace.nativeElement, this._ideWrapper.nativeElement],
    //   splitOptions
    // );

    this._store.select(changeSpaceMediaSelector).subscribe((media) => {
      this._elementService.recreateFromStorage(media);
    });

    this._renderer.listen(this._mainSpace.nativeElement, 'click', () => {
      this.onChangeSelectedElement(undefined);
    });

    this._store
      .select(
        createSelector(
          uiElementEditorFeatureSelector,
          (state: CustomElementsState) => state.selectedElement
        )
      )
      .subscribe((selectedEl) => {
        this.onChangeSelectedElement(selectedEl);
      });
  }

  public changeSpaceSize(spaceMedia: string) {
    const rect = this._mainSpace.nativeElement.getBoundingClientRect();
    let scale = 1;

    switch (spaceMedia) {
      case SpaceMedia[SpaceMedia.Phone]:
        if (rect.width < 480) {
          scale = rect.width / 480;
        }

        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'transform',
          `scale(${scale})`
        );
        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'flex-basis',
          '480px'
        );

        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this._appendCustomElement.nativeElement,
          'layout-sm'
        );
        break;
      case SpaceMedia[SpaceMedia.Tablet]:
        if (rect.width < 768) {
          scale = rect.width / 768;
        }

        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'transform',
          `scale(${scale})`
        );
        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'flex-basis',
          '768px'
        );

        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this._appendCustomElement.nativeElement,
          'layout-xl'
        );
        break;
      case SpaceMedia[SpaceMedia.Laptop]:
        if (rect.width < 1024) {
          scale = rect.width / 1024;
        }

        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'transform',
          `scale(${scale})`
        );
        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'flex-basis',
          '1024px'
        );

        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this._appendCustomElement.nativeElement,
          'layout-xl'
        );
        break;
      case SpaceMedia[SpaceMedia.Desktop]:
        if (rect.width < 1200) {
          scale = rect.width / 1200;
        }

        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'transform',
          `scale(${scale})`
        );
        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'flex-basis',
          '1200px'
        );

        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this._appendCustomElement.nativeElement,
          'layout-xxl'
        );
        break;
    }

    this._store.dispatch(
      changingSpaceMediaAction({
        fromMedia: this._customElementRepository.currentMedia,
        toMedia: spaceMedia,
      })
    );
    // this._elementService.getAllElements().forEach((el) => {
    //   el.movable?.updateRect();
    // });
  }

  private onChangeSelectedElement(selectedEl: CustomElement | undefined) {
    if (this.selectedElement) {
      this._renderer.removeChild(
        this.selectedElement.customMovableElement.movableElement,
        this.selectedElement.closeBtnElement
      );
    }

    if (!selectedEl) {
      this.selectedElement = undefined;
      return;
    }

    const element = this._elementService.getElement(selectedEl.uid);
    if (!element) return;

    const closeBtnElement = this._renderer.createElement('div') as HTMLElement;
    this._renderer.addClass(closeBtnElement, 'close-icon');
    this._renderer.listen(closeBtnElement, 'click', (event) => {
      this._store.dispatch(
        removeCustomElementAction({
          element: element.customElementModel,
          fromStorage: true,
        })
      );
    });

    this._renderer.appendChild(element.movableElement, closeBtnElement);

    element.setCloseBtnElement(closeBtnElement);

    const elPosition = element.customElementModel.styles.find(
      (x) => x.name === 'position'
    );
    this.selectedElement = {
      customMovableElement: element,
      closeBtnElement,
      position: elPosition?.value ?? 'relative',
    };
  }

  public changeSelectedElPosition() {
    if (!this.selectedElement) return;

    const newPosition =
      this.selectedElement.customMovableElement.movableElement.style
        .position === 'absolute'
        ? 'relative'
        : 'absolute';

    this._store.dispatch(
      addOrUpdateElementStyle({
        uid: this.selectedElement.customMovableElement.customElementModel.uid,
        values: [new KeyValuePair('position', newPosition)],
      })
    );

    this.selectedElement.position = newPosition;
  }

  public addElement() {
    this._customElementRepository.addElement(
      new CustomElementModel(
        'rittry-element',
        Date.now().toString(),
        'rt6945ef-ff6b-4671-bc5c-a4371a7743f6'
      )
    );
  }
}
