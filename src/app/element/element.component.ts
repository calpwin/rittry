import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'rittry-element',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ElementComponent implements OnInit {

  constructor(
    private readonly _renderer: Renderer2,
    private _store: Store<any>,
    @Inject(DOCUMENT) private _document: Document,
    private _elRef: ElementRef
  ) { }

  ngOnInit(): void {
  }
}
