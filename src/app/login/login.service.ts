import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';

import { LoginInfo, LoginQuery, CurrentUserKey } from './login.interfaces';
import { Http } from '@angular/http';
import { toQuery, toCompleted, toBehavior, toRemoteData, RemoteData } from '../remote-data';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable()
export class LoginService {
  public readonly input: Subject<LoginQuery> = new Subject<LoginQuery>();
  public readonly logout: Subject<boolean> = new Subject<boolean>();
  public readonly login: Observable<RemoteData<LoginInfo>>;
  public readonly loginCompleted: Observable<LoginInfo>;
  public readonly user: Observable<LoginInfo>;

  constructor(private http: Http, private localStorage: LocalStorageService) {
    const query = (params: LoginQuery) => http.get('/api/login', {params});
    this.login = toBehavior(toQuery(this.input, query));

    this.loginCompleted = toCompleted(this.login);
    this.user = Observable.merge(
      this.logout.mapTo(undefined),
      this.loginCompleted.startWith(window['currentUser'] || this.localStorage.retrieve(CurrentUserKey) || undefined)
    );

    this.loginCompleted.subscribe(info => this.localStorage.store(CurrentUserKey, info));
    this.logout.subscribe(() => this.localStorage.clear(CurrentUserKey));
  }
}
