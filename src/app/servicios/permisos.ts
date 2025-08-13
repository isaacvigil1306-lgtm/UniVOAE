import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Permisos {
  constructor(private firestore: Firestore) {}

  login(username: string, password: string): Observable<any[]> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(
      usuariosRef,
      where('username', '==', username),
      where('password', '==', password)
    );
    return from(getDocs(q).then(snap => snap.docs.map(doc => doc.data())));
  }
}
