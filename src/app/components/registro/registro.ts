import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Firestore, collection, getDocs, query, where, addDoc, doc, getDoc, updateDoc } from '@angular/fire/firestore';

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
  mostrarModal: boolean = false;
    mostrarModalAsistencia: boolean = false; // Modal para asistencia
    

  constructor(private router: Router, private firestore: Firestore) {}

  async ngOnInit() {
    await this.cargarActividadesFuturas();
  }

  async cargarActividadesFuturas() {
  const actividadesRef = collection(this.firestore, 'actividades');
  const querySnapshot = await getDocs(actividadesRef);
  

  const hoy = new Date().toLocaleDateString("es-HN", { timeZone: "America/Tegucigalpa" });
  const todasActividades = querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((act: any) => act.fecha == hoy);

  const actividadesDisponibles: any[] = [];

  for (const act of todasActividades) {
    // Verificar si ya tiene asistencia registrada
    const asistenciasRef = collection(this.firestore, 'asistencias');
    const asistenciasSnap = await getDocs(query(asistenciasRef, where('idActividad', '==', act.id)));

    if (asistenciasSnap.empty) {
      // ✅ Solo agregar si no hay asistencia aún
      actividadesDisponibles.push(act);
    }
  }

  this.actividades = actividadesDisponibles;
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

      // Cargar estudiantes inscritos
      const inscripcionesRef = collection(this.firestore, 'inscripciones');
      const q = query(inscripcionesRef, where('idActividad', '==', this.actividadSeleccionadaId));
      const querySnapshot = await getDocs(q);

      this.inscritos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        asistio: false // valor inicial para el checkbox
      }));
    }
  }

async guardarAsistencia() {
    if (!this.actividadSeleccionada) return;

    const asistenciasRef = collection(this.firestore, 'asistencias');

    for (const estudiante of this.inscritos) {
      // Evitar duplicados
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
          fechaRegistro: this.actividadSeleccionada.fecha,
          horasAcreditadas: estudiante.asistio ? this.actividadSeleccionada.horas : 0
        });
      }
    }

    alert('Asistencia guardada con éxito');
  }
}