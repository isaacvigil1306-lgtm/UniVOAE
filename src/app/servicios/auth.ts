import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

export interface UsuarioDatos {
  correo: string;
  rol: string;
  aprobado: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuarioSubject = new BehaviorSubject<UsuarioDatos | null>(null);
  usuario$ = this.usuarioSubject.asObservable(); // 🔔 para que tus componentes se suscriban

  private auth = getAuth();
  private firestore = inject(Firestore); // ✅ Inyectamos Firestore

  constructor() {
    this.escucharAuth();
  }

  private escucharAuth() {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user?.email) {
        // 🔎 Consultar datos en Firestore usando this.firestore
        const userDoc = await getDoc(doc(this.firestore, 'usuarios', user.email));
        if (userDoc.exists()) {
          const data = userDoc.data();
          this.usuarioSubject.next({
            correo: user.email,
            rol: data['rol'],
            aprobado: data['aprobado']
          });
        } else {
          console.warn('⚠️ Usuario no encontrado en Firestore');
          this.usuarioSubject.next(null);
        }
      } else {
        // No hay sesión
        this.usuarioSubject.next(null);
      }
    });
  }

  cerrarSesion() {
    return this.auth.signOut();
  }
}
