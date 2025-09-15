import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { ActividadesService } from '../../servicios/actividades';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';


import { Firestore, collection, doc, deleteDoc, getDocs, query, where, getDoc, updateDoc } from '@angular/fire/firestore';


type EstadoInscripcion = 'aceptado' | 'rechazado' | 'pendiente' | 'falta-pago';

@Component({
  selector: 'app-estudiantes-actividad',
  templateUrl: './estudiantesactividad.html',
  styleUrls: ['./estudiantesactividad.scss'],
   imports: [CommonModule, RouterModule]
})
export class EstudiantesActividad implements OnInit {
  actividadId!: string;
  nombreActividad!: string;
  estudiantes: any[] = [];
  

  constructor(
    private route: ActivatedRoute,
    private actividadesService: ActividadesService,
    private firestore: Firestore,
    public router: Router
    
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.actividadId = params['id'];
      this.nombreActividad = this.route.snapshot.queryParamMap.get('nombre') || '';
      this.cargarEstudiantes();
    });
  }

  aceptarATodos() {
  if (!this.estudiantes || this.estudiantes.length === 0) return;

  Swal.fire({
    title: '¿Estás seguro?',
    text: `Se aceptarán todos los estudiantes de la actividad.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, aceptar todos',
    cancelButtonText: 'No, cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      for (const est of this.estudiantes) {
        this.cambiarEstado(est, 'aceptado');
      }
      Swal.fire('Listo', 'Todos los estudiantes fueron aceptados.', 'success');
    }
  });
}

toggleTooltip(estudiante: any) {
  estudiante.mostrarTooltip = !estudiante.mostrarTooltip;

  // opcional: cerrar automáticamente después de 3 segundos
  if (estudiante.mostrarTooltip) {
    setTimeout(() => estudiante.mostrarTooltip = false, 3000);
  }
}

  cargarEstudiantes() {
    this.actividadesService.obtenerInscritos(this.actividadId).subscribe(data => {
      this.estudiantes = data;
    });
  }

  enviarMensaje(estudiante: any) {
    Swal.fire({
      title: `Mensaje para ${estudiante.nombre}`,
      input: 'textarea',
      inputLabel: 'Escribe tu mensaje',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        const mensaje = result.value;
        this.cambiarEstado(estudiante, estudiante.estadoInscripcion.split(':')[0] as EstadoInscripcion, mensaje);
        Swal.fire('Enviado', 'Tu mensaje ha sido enviado correctamente.', 'success');
      }
    });
  }

  async cancelarInscripcionAdmin(estudiante: any) {
    if (!estudiante.correo || !estudiante.idActividad) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la inscripción de ${estudiante.nombre}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener',
    });

    if (!result.isConfirmed) return;

    const inscripcionesRef = collection(this.firestore, 'inscripciones');
    const q = query(
      inscripcionesRef,
      where('correo', '==', estudiante.correo),
      where('idActividad', '==', estudiante.idActividad)
    );

    const querySnapshot = await getDocs(q);
    for (const inscripcion of querySnapshot.docs) {
      await deleteDoc(doc(this.firestore, 'inscripciones', inscripcion.id));
    }

    // Actualizar cupo
    const actRef = doc(this.firestore, 'actividades', estudiante.idActividad);
    const actSnap = await getDoc(actRef);
    if (actSnap.exists()) {
      const actividad = actSnap.data();
      await updateDoc(actRef, { cupo: (actividad['cupo'] || 0) + 1 });
    }

    Swal.fire('Cancelada', `La inscripción de ${estudiante.nombre} ha sido cancelada.`, 'success');
    this.cargarEstudiantes();
  }

  cambiarEstado(estudiante: any, nuevoEstado: EstadoInscripcion, mensaje?: string) {
    if (!estudiante.id) return;
    const estadoConMensaje = mensaje ? `${nuevoEstado}: ${mensaje}` : nuevoEstado;

    this.actividadesService.actualizarInscripcion(estudiante.id, { estadoInscripcion: estadoConMensaje })
      .then(() => {
        estudiante.estadoInscripcion = estadoConMensaje;
      }).catch(err => {
        console.error('Error al actualizar el estado', err);
        Swal.fire('Error', 'No se pudo actualizar el estado del estudiante', 'error');
      });
  }
}
