import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { CookiesService } from 'ish-core/services/cookies/cookies.service';

@Injectable({ providedIn: 'root' })
export class CookieFacade {
  openCookieDialog$ = new Subject();

  constructor(public cookiesService: CookiesService) {}
}
