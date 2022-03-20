import { getIntoGroupAction, getOutFromGroupAction, unGroupElementsAction } from './../rxjs/actions';
import { CustomElement } from './../rxjs/reducer';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { removeCustomElementAction } from '../rxjs/actions';

@Component({
  selector: 'rittry-element-fast-action',
  templateUrl: './element-fast-action.component.html',
  styleUrls: ['./element-fast-action.component.scss'],
})
export class ElementFastActionComponent implements OnInit {
  public groupRootEl: CustomElement | undefined;
  public currentSpaceEl: CustomElement | undefined;

  constructor(private readonly _store: Store<any>) {}

  ngOnInit(): void {}

  closeClick() {
    if (!this.groupRootEl) return;

    this._store.dispatch(
      removeCustomElementAction({
        element: this.groupRootEl,
        fromStorage: true,
      })
    );
  }

  ungroupClick() {
    if (!this.groupRootEl) return;

    this._store.dispatch(
      unGroupElementsAction({
        groupElId: this.groupRootEl.id
      })
    );
  }

  outFromGroupClick() {
    if (!this.groupRootEl) return;

    this._store.dispatch(
      getOutFromGroupAction({
        groupElId: this.groupRootEl.id
      })
    );
  }

  intoGroupClick() {
    if (!this.groupRootEl) return;

    this._store.dispatch(
      getIntoGroupAction({
        groupElId: this.groupRootEl.id
      })
    );
  }
}
