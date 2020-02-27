import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { IngresoEgreso } from './ingreso-egreso.model';
import { AuthService } from '../auth/auth.service';
import { AppState } from '../app.reducer';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import { auth } from 'firebase';
import { SetItemsAction, UnsetItemsAction } from './ingreso-egreso.actions';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class IngresoEgresoService {

    ingresoEgresoListenerSubscription: Subscription = new Subscription();
    ingresoEgresoItemsSubscription: Subscription = new Subscription();

    constructor(private afDB: AngularFirestore, public authService: AuthService, private store: Store<AppState>) { }


    initIngresoEgresoListener() {
        this.ingresoEgresoListenerSubscription = this.store.select('auth')
            .pipe(
                // tslint:disable-next-line: no-shadowed-variable
                filter(auth => auth.user != null)
            )
            // tslint:disable-next-line: no-shadowed-variable
            .subscribe(auth => this.ingresoEgresoItems(auth.user.uid));
    }

    private ingresoEgresoItems(uid: string) {
        this.ingresoEgresoItemsSubscription = this.afDB.collection(`${uid}/ingresos-egresos/items`)
            .snapshotChanges()
            .pipe(
                map(docData => {

                    return docData.map(doc => {
                        return {
                            uid: doc.payload.doc.id,
                            ...doc.payload.doc.data() as {}
                        };
                    });
                })
            )
            .subscribe((coleccion: any) => {
                this.store.dispatch(new SetItemsAction(coleccion));
                console.log(coleccion);
            });
    }


    cancelarSubscription() {

        this.ingresoEgresoItemsSubscription.unsubscribe();
        this.ingresoEgresoListenerSubscription.unsubscribe();

        this.store.dispatch(new UnsetItemsAction());
    }

    crearIngresoEgreso(ingresoEgreso: IngresoEgreso) {

        const user = this.authService.getUsuario();
        return this.afDB.doc(`${user.uid}/ingresos-egresos`)
            .collection('items').add({ ...ingresoEgreso });

    }

    borrarIngresoEgreso(uid: string) {
        const user = this.authService.getUsuario();
        return this.afDB.doc(`${user.uid}/ingresos-egresos/items/${uid}`)
            .delete();

    }
}
