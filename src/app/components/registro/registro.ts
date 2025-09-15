import { Component, OnInit } from '@angular/core';
import { CommonModule,NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Firestore, collection, getDocs, doc, getDoc, addDoc, query, where } from '@angular/fire/firestore';
import { Timestamp } from '@angular/fire/firestore';
import Swal from 'sweetalert2';


type EstadoInscripcion = 'aceptado' | 'rechazado' | 'pendiente' | 'falta-pago';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss'],
  imports: [CommonModule, FormsModule, RouterModule,NgIf, NgFor],
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

  // ------------------ Cargar actividades de hoy ------------------
  async cargarActividadesHoy() {
    const actividadesRef = collection(this.firestore, 'actividades');
    const querySnapshot = await getDocs(actividadesRef);

    // Fecha de hoy en Honduras
    const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Tegucigalpa' }));
    const hoyStr = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}-${String(ahora.getDate()).padStart(2,'0')}`;

    this.actividades = querySnapshot.docs
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
      .filter(act => act.fechaStr === hoyStr) // Solo actividades de hoy
      .sort((a, b) => a.fechaStr.localeCompare(b.fechaStr));
  }

  // ------------------ Seleccionar actividad ------------------
  async seleccionarActividad(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.actividadSeleccionadaId = select.value || null;
    this.inscritos = [];

    if (!this.actividadSeleccionadaId) return;

    // Obtener datos de la actividad
    const actividadDoc = await getDoc(doc(this.firestore, 'actividades', this.actividadSeleccionadaId));
    if (actividadDoc.exists()) {
      this.actividadSeleccionada = { id: actividadDoc.id, ...actividadDoc.data() };
    }

    // Obtener estudiantes inscritos con estado "aceptado"
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

  // ------------------ Guardar asistencia ------------------
async guardarAsistencia() {
  if (!this.actividadSeleccionada) return;

  const asistenciasRef = collection(this.firestore, 'asistencias');

  for (const estudiante of this.inscritos) {
    console.log("Procesando identidad:", estudiante.identidad); 
    // 👆 aquí imprimes la identidad

    const existeSnap = await getDocs(query(
      asistenciasRef,
      where('idActividad', '==', this.actividadSeleccionadaId),
      where('identidad', '==', estudiante.identidad),
    ));

    if (existeSnap.empty) {
      await addDoc(asistenciasRef, {
        idActividad: this.actividadSeleccionadaId,
        identidad: estudiante.identidad,
        nombre: estudiante.nombre,
        asistio: estudiante.asistio,
         correo: estudiante.correo,
        fechaRegistro: new Date(),
        horasAcreditadas: estudiante.asistio ? this.actividadSeleccionada.horas : 0
      });

      console.log(`✅ Asistencia registrada para: ${estudiante.nombre} (${estudiante.identidad})`);
    } else {
      console.log(`⚠️ Ya existía asistencia para: ${estudiante.nombre} (${estudiante.identidad})`);
    }
  }

   Swal.fire({
    title: '¡Asistencia guardada!',
    text: 'Todas las asistencias fueron registradas correctamente.',
    icon: 'success',
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#3085d6'
  });
}

}
