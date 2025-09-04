import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Firestore, collection, getDocs, query, where, addDoc, doc, getDoc } from '@angular/fire/firestore';
import { Timestamp } from '@angular/fire/firestore';
type EstadoInscripcion = 'aceptado' | 'rechazado' | 'pendiente' | 'falta-pago';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class Registro implements OnInit {
  actividades: any[] = [];
  inscritos: any[] = [];
  actividadSeleccionadaId: string | null = null;
  actividadSeleccionada: any = null;

  constructor(private router: Router, private firestore: Firestore) {}

  async ngOnInit() {
    await this.cargarActividadesHoy();
  }

  async cargarActividadesFuturas() {
    const actividadesRef = collection(this.firestore, 'actividades');
    const querySnapshot = await getDocs(actividadesRef);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const todasActividades = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((act: any) => {
        const fechaAct = new Date(act.fecha);
        fechaAct.setHours(0, 0, 0, 0);
        return fechaAct >= hoy; // Solo actividades de hoy en adelante
      });

    this.actividades = todasActividades;
  }

async cargarActividadesHoy() {
  const actividadesRef = collection(this.firestore, 'actividades');
  const querySnapshot = await getDocs(actividadesRef);

  // Fecha de hoy en Honduras en formato "YYYY-MM-DD"
  const hoyHonduras = new Date().toLocaleString("en-US", { timeZone: "America/Tegucigalpa" });
  const hoy = new Date(hoyHonduras);
  const hoyStr = hoy.toISOString().split('T')[0]; // "YYYY-MM-DD"

  const actividadesHoy = querySnapshot.docs
    .map(doc => {
      const data = doc.data();
      let fechaStr: string;

      if (data['fecha'] instanceof Timestamp) {
        fechaStr = data['fecha'].toDate().toISOString().split('T')[0];
      } else {
        fechaStr = new Date(data['fecha']).toISOString().split('T')[0];
      }

      return { id: doc.id, ...data, fechaStr };
    })
    .filter(act => act.fechaStr >= hoyStr); // hoy o futura

  this.actividades = actividadesHoy;
}




  async seleccionarActividad(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.actividadSeleccionadaId = select.value || null;
    this.inscritos = [];

    if (this.actividadSeleccionadaId) {
      // Obtener datos de la actividad
      const actividadDoc = await getDoc(doc(this.firestore, 'actividades', this.actividadSeleccionadaId));
      if (actividadDoc.exists()) {
        this.actividadSeleccionada = { id: actividadDoc.id, ...actividadDoc.data() };
      }

      // Cargar estudiantes inscritos con estado "aceptado"
      const inscripcionesRef = collection(this.firestore, 'inscripciones');
      const q = query(
        inscripcionesRef,
        where('idActividad', '==', this.actividadSeleccionadaId),
        where('estadoInscripcion', '==', 'aceptado')
      );
      const querySnapshot = await getDocs(q);

      this.inscritos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        asistio: false
      }));
    }
  }

  async guardarAsistencia() {
    if (!this.actividadSeleccionada) return;

    const asistenciasRef = collection(this.firestore, 'asistencias');

    for (const estudiante of this.inscritos) {
      const existeSnap = await getDocs(query(
        asistenciasRef,
        where('idActividad', '==', this.actividadSeleccionadaId),
        where('identidad', '==', estudiante.identidad)
      ));

      if (existeSnap.empty) {
        await addDoc(asistenciasRef, {
          idActividad: this.actividadSeleccionadaId,
          identidad: estudiante.identidad,
          nombre: estudiante.nombre,
          asistio: estudiante.asistio,
          fechaRegistro: new Date(),
          horasAcreditadas: estudiante.asistio ? this.actividadSeleccionada.horas : 0
        });
      }
    }

    alert('Asistencia guardada con éxito');
  }
}

/*
//Codigo para actividades de hoy
async cargarActividadesHoy() {
  const actividadesRef = collection(this.firestore, 'actividades');
  const querySnapshot = await getDocs(actividadesRef);

  // Obtener fecha de hoy en Honduras
  const hoy = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Tegucigalpa" }));
  hoy.setHours(0, 0, 0, 0); // inicio del día
  const finDia = new Date(hoy);
  finDia.setHours(23, 59, 59, 999); // fin del día

  const actividadesHoy = querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((act: any) => {
      const fechaAct = new Date(act.fecha);
      return fechaAct >= hoy && fechaAct <= finDia;
    });

  this.actividades = actividadesHoy;
}
*/ 