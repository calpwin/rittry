import { SignalRService } from './hub-connection';
import {
  Component,
  ComponentRef,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { addUiElementSelector, CustomElement, CustomElementsState } from './rxjs/reducer';

@Component({
  selector: 'rittry-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  _updateComponentAction: Observable<CustomElement | undefined>;

  constructor(
    private signalRService: SignalRService,
    private http: HttpClient,
    private readonly _store: Store<any>,
    private readonly _renderer: Renderer2
  ) {
    this._updateComponentAction = _store.select(addUiElementSelector);
  }

  @ViewChild('elem') elem!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.signalRService.startConnection();
    this.signalRService.addTransferChartDataListener();

    this._updateComponentAction.subscribe((customElement) => {
      console.log(`Component prop from store`, customElement);

      if (!this.elem || !customElement) return;

      let rtlElem = document.createElement(customElement.htmlCode);

      this.elem.nativeElement.append(rtlElem);

      customElement.style.forEach((prop) => {
        this._renderer.setStyle(rtlElem, prop.name, prop.value);
      });
    });
  }
}
