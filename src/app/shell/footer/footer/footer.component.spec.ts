import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent, MockDirective } from 'ng-mocks';
import { instance, mock } from 'ts-mockito';

import { ServerHtmlDirective } from 'ish-core/directives/server-html.directive';
import { CookieFacade } from 'ish-core/facades/cookie.facade';

import { FooterComponent } from './footer.component';

describe('Footer Component', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let element: HTMLElement;
  let component: FooterComponent;
  let cookieFacade: CookieFacade;

  beforeEach(async(() => {
    cookieFacade = mock(cookieFacade);

    TestBed.configureTestingModule({
      imports: [BrowserTransferStateModule, RouterTestingModule, TranslateModule.forRoot()],
      declarations: [FooterComponent, MockComponent(FaIconComponent), MockDirective(ServerHtmlDirective)],
      providers: [{ provide: CookieFacade, useFactory: () => instance(cookieFacade) }],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;
      });
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
