import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc, where, query } from '@angular/fire/firestore';
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

  agregarActividad(actividad: Actividad) {
    const actividadesRef = collection(this.firestore, 'actividades');
    return addDoc(actividadesRef, actividad);
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

}