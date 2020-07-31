import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { CookieBannerCookiedata } from '../../../models/cookie-banner-cookiedata.model';
import { CookieBannerOptions } from '../../../models/cookie-banner-options.model';

/**
 * Cookie Banner Component
 */
@Component({
  selector: 'ish-cookie-banner-modal',
  templateUrl: './cookie-banner-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieBannerModalComponent implements OnInit {
  @Input()
  options: CookieBannerOptions;

  @Input()
  cookieData?: CookieBannerCookiedata;

  @Output() close = new EventEmitter<void>();
  @Output() onChange = new EventEmitter<string[]>();

  selectedIds = {};

  ngOnInit() {
    this.options.options.map(x =>
      x.required || this.cookieData?.enabledCookies.includes(x.id) ? (this.selectedIds[x.id] = true) : undefined
    );
  }

  submit() {
    this.onChange.emit(
      Object.keys(this.selectedIds).reduce((acc, x) => (this.selectedIds[x] ? acc.push(x) && acc : acc), [])
    );
    this.hide();
  }

  hide() {
    this.close.emit();
  }
}

const components = [CookieBannerModalComponent];

@NgModule({
  declarations: [...components],
  imports: [CommonModule, TranslateModule],
  exports: [...components],
})
// tslint:disable-next-line:project-structure
export class CookieBannerModalModule {
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  resolveCookieBannerModalComponent(): ComponentFactory<CookieBannerModalComponent> {
    return this.componentFactoryResolver.resolveComponentFactory(CookieBannerModalComponent);
  }
}
