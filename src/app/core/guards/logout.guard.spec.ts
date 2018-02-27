import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Action, Store } from '@ngrx/store';
import { anything, capture, instance, mock, verify } from 'ts-mockito';
import { CoreState, UserActionTypes } from '../store/user';
import { LogoutGuard } from './logout.guard';

describe('LogoutGuard', () => {

  describe('canActivate()', () => {
    let logoutGuard: LogoutGuard;
    let storeMock: Store<CoreState>;

    beforeEach(async(() => {
      storeMock = mock(Store);

      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule
        ],
        providers: [LogoutGuard,
          { provide: Store, useFactory: () => instance(storeMock) }
        ]

      }).compileComponents();
    }));

    beforeEach(() => {
      logoutGuard = TestBed.get(LogoutGuard);
    });

    it('should log out when called', () => {
      logoutGuard.canActivate(null, null);
      verify(storeMock.dispatch(anything())).called();

      const [arg] = capture(storeMock.dispatch).last();
      expect((arg as Action).type).toBe(UserActionTypes.LogoutUser);
    });

  });
});