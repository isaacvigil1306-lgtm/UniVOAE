import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc, where, query, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Actividad {
  id?: string;
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  horas: number;
  cupo: number;
  pago: boolean;
  descripcion?: string;
    imagen?: string; // 📌 nuevo
    estado: boolean;
    visible: boolean;
      correoPago?: string | null;
  precio?: number | null;
  banco?: string | null;
  numeroCuenta?: string | null;
  
  
}

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {

  constructor(private firestore: Firestore) {}

  obtenerActividades(): Observable<Actividad[]> {
    const actividadesRef = collection(this.firestore, 'actividades');
    return collectionData(actividadesRef, { idField: 'id' }) as Observable<Actividad[]>;
  }

  

  actualizarInscripcion(id: string, cambios: any) {
  const inscripcionDoc = doc(this.firestore, `inscripciones/${id}`);
  return updateDoc(inscripcionDoc, cambios);
}

 agregarActividad(actividad: Actividad) {
  const actividadesRef = collection(this.firestore, 'actividades');
  return addDoc(actividadesRef, {
    nombre: actividad.nombre,
    fecha: actividad.fecha,
    hora: actividad.hora,
    lugar: actividad.lugar,
    horas: actividad.horas,
    cupo: actividad.cupo,
    pago: actividad.pago || false,
    correoPago: actividad.correoPago || null,
    precio: actividad.precio || null,
    banco: actividad.banco || null,
    numeroCuenta: actividad.numeroCuenta || null,
    descripcion: actividad.descripcion || '',
    imagen: actividad.imagen || '',
    estado: actividad.estado,
    visible: actividad.visible,
    
  });
}


  actualizarActividad(id: string, actividad: Partial<Actividad>) {
    const actividadDoc = doc(this.firestore, `actividades/${id}`);
    return updateDoc(actividadDoc, actividad);
  }

  eliminarActividad(id: string) {
    const actividadDoc = doc(this.firestore, `actividades/${id}`);
    return deleteDoc(actividadDoc);
  }

  // Si quieres traer inscritos de una actividad, ejemplo:
  obtenerInscritos(idActividad: string) {
  const inscritosRef = collection(this.firestore, 'inscripciones'); // coincide con inscripcion.ts
  const q = query(inscritosRef, where('idActividad', '==', idActividad)); // usa 'idActividad'
  return collectionData(q, { idField: 'id' });
}
  // 📌 NUEVO: obtener datos del estudiante logueado
  obtenerDatosEstudiante(idUsuario: string): Observable<any> {
    const usuarioDoc = doc(this.firestore, 'usuarios', idUsuario);
    return new Observable(observer => {
      getDoc(usuarioDoc).then(docSnap => {
        if (docSnap.exists()) {
          observer.next(docSnap.data());
        } else {
          observer.next(null);
        }
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }

  // 📌 NUEVO: obtener actividades de un usuario específico
  obtenerActividadesPorUsuario(idUsuario: string): Observable<Actividad[]> {
    const actividadesRef = collection(this.firestore, 'actividades');
    const q = query(actividadesRef, where('idUsuario', '==', idUsuario));
    return collectionData(q, { idField: 'id' }) as Observable<Actividad[]>;
  }

}