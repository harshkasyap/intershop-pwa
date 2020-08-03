import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { Subject, combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';

import { isStickyHeader } from 'ish-core/store/core/viewconf';
import { mapToPayload } from 'ish-core/utils/operators';

import {
  MessagesPayloadType,
  displayErrorMessage,
  displayInfoMessage,
  displaySuccessMessage,
  displayWarningMessage,
} from './messages.actions';

@Injectable()
export class MessagesEffects {
  constructor(
    private actions$: Actions,
    private store: Store,
    private translate: TranslateService,
    private toastr: ToastrService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  private applyStyle$ = new Subject();

  infoToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(displayInfoMessage),
        mapToPayload(),
        tap(payload => {
          this.toastr.info(...this.composeToastServiceArguments(payload));
          this.applyStyle$.next();
        })
      ),
    { dispatch: false }
  );

  errorToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(displayErrorMessage),
        mapToPayload(),
        tap(payload => {
          this.toastr.error(...this.composeToastServiceArguments(payload));
          this.applyStyle$.next();
        })
      ),
    { dispatch: false }
  );

  warningToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(displayWarningMessage),
        mapToPayload(),
        tap(payload => {
          this.toastr.warning(...this.composeToastServiceArguments(payload));
          this.applyStyle$.next();
        })
      ),
    { dispatch: false }
  );

  successToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(displaySuccessMessage),
        mapToPayload(),
        tap(payload => {
          this.toastr.success(...this.composeToastServiceArguments(payload));
          this.applyStyle$.next();
        })
      ),
    { dispatch: false }
  );

  setToastrStyle$ = createEffect(
    () =>
      combineLatest([this.store.pipe(select(isStickyHeader)), this.applyStyle$]).pipe(
        tap(([sticky]) => {
          const container = this.document.getElementById('toast-container');
          if (container) {
            if (sticky) {
              container.style.position = 'fixed';
              container.style.top = '0px';
            } else {
              container.style.position = 'absolute';
              container.style.top = '130px';
            }
          }
        })
      ),
    { dispatch: false }
  );

  private composeToastServiceArguments(payload: MessagesPayloadType): [string, string, Partial<IndividualConfig>] {
    return [
      // message translation
      this.translate.instant(payload.message, payload.messageParams),
      // title translation
      payload.title ? this.translate.instant(payload.title, payload.titleParams) : payload.title,
      // extra options
      {
        timeOut: payload.duration !== undefined ? payload.duration : 5000,
        extendedTimeOut: 5000,
        progressBar: false,
        closeButton: false,
        enableHtml: true,
      },
    ];
  }
}
