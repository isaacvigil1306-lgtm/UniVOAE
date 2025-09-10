
import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Usuario {
  nombre?: string;
  numeroCuenta?: string;
  correo: string;
  telefono?: string;
  identidad?: string;
  carrera?: string;
  rol?: 'pendiente' | 'usuario' | 'admin';
  aprobado?: boolean;
}



@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private firestore: Firestore) {}

  // Obtener usuario por correo
obtenerUsuariosPendientes(): Observable<Usuario[]> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('rol', '==', 'pendiente'));
    return collectionData(q, { idField: 'id' }) as Observable<Usuario[]>;
  }

  // Obtener usuario por correo
  obtenerUsuarioPorCorreo(correo: string): Observable<Usuario[]> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('correo', '==', correo));
    return collectionData(q, { idField: 'id' }) as Observable<Usuario[]>;
  }

  // Guardar o actualizar usuario
  guardarUsuario(usuario: Usuario): Promise<void> {
    const docRef = doc(this.firestore, `usuarios/${usuario.correo}`);
    return setDoc(docRef, usuario, { merge: true });
  }
}
