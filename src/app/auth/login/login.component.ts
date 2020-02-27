import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { AppState } from '../../app.reducer';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit, OnDestroy {
  cargando: boolean;
  subscription: Subscription;
  constructor(public authService: AuthService, public store: Store<AppState>) { }

  ngOnInit(): void {
    this.subscription = this.store.select('ui')
      .subscribe(ui => this.cargando = ui.isLoading);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSubmit(data: any) {
    console.log(data);
    this.authService.logIn(data.email, data.password);
  }

}
