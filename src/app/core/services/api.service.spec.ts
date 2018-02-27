import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { empty } from 'rxjs/observable/empty';
import { of } from 'rxjs/observable/of';
import { anything, instance, mock, verify, when } from 'ts-mockito/lib/ts-mockito';
import { CoreState } from '../store/user';
import { ApiService } from './api.service';
import { ICM_SERVER_URL, REST_ENDPOINT } from './state-transfer/factories';

describe('ApiService', () => {
  const BASE_URL = 'http://www.example.org/';
  let httpClientMock: HttpClient;
  let apiService: ApiService;
  let storeMock: Store<CoreState>;

  beforeEach(() => {
    httpClientMock = mock(HttpClient);
    storeMock = mock(Store);
    when(storeMock.pipe(anything())).thenReturn(empty());

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useFactory: () => instance(httpClientMock) },
        { provide: REST_ENDPOINT, useValue: BASE_URL },
        { provide: ICM_SERVER_URL, useValue: BASE_URL },
        { provide: Store, useFactory: () => instance(storeMock) },
        ApiService
      ]
    });

    apiService = TestBed.get(ApiService);
  });

  it('should call the httpClient.get method when apiService.get method is called.', () => {
    when(httpClientMock.get(anything(), anything())).thenReturn(of(new ArrayBuffer(3)));
    verify(httpClientMock.get(anything(), anything())).never();
    apiService.get('');
    verify(httpClientMock.get(anything(), anything())).once();
  });

  it('should call the httpClient.put method when apiService.put method is called.', () => {
    when(httpClientMock.put(anything(), anything(), anything())).thenReturn(of(new ArrayBuffer(3)));
    verify(httpClientMock.put(anything(), anything(), anything())).never();
    apiService.put('');
    verify(httpClientMock.put(anything(), anything(), anything())).once();
  });


  it('should call the httpClient.post method when apiService.post method is called.', () => {
    when(httpClientMock.post(anything(), anything(), anything())).thenReturn(of(new ArrayBuffer(3)));
    verify(httpClientMock.post(anything(), anything(), anything())).never();
    apiService.post('');
    verify(httpClientMock.post(anything(), anything(), anything())).once();
  });

  it('should call the httpClient.delete method when apiService.delete method is called.', () => {
    when(httpClientMock.delete(anything())).thenReturn(of(new ArrayBuffer(3)));
    verify(httpClientMock.delete(anything())).never();
    apiService.delete('');
    verify(httpClientMock.delete(anything())).once();
  });
});