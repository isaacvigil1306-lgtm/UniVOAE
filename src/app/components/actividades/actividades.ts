import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { Firestore, collection, collectionData, doc, deleteDoc, query, where, getDocs,updateDoc, getDoc } from '@angular/fire/firestore';

import { ActividadesService, Actividad } from '../../servicios/actividades';
type EstadoInscripcion = 'aceptado' | 'rechazado' | 'pendiente' | 'falta-pago';

@Component({
  selector: 'app-actividades',
  standalone: true,
  templateUrl: './actividades.html',
  styleUrls: ['./actividades.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class Actividades implements OnInit {
  hoy: string = this.getFechaLocal();

tablaCompletaAbierta = false;
  actividades: Actividad[] = [];
  nuevaActividad: Actividad = this.resetActividad();
  modalAbierto = false;
  modoEdicion = false;
  estudiantes: any[] = [];
  mostrarEstudiantes = false;

  actividadSeleccionada: Actividad | null = null;
  mostrarInscritos = false;
  inscritosPorActividad: { [key: string]: any[] } = {};

  constructor(private actividadesService: ActividadesService, private firestore: Firestore) {}

  ngOnInit() {
    this.cargarActividades();
  }

  // ---------------- FECHA LOCAL ----------------
  getFechaLocal(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

tablaExpandida = false;
abrirTablaPantallaCompleta() {
  this.tablaExpandida = true;
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
      // concatena con el estado actual
      this.cambiarEstado(estudiante, estudiante.estadoInscripcion.split(':')[0] as EstadoInscripcion, mensaje);
      Swal.fire('Enviado', 'Tu mensaje ha sido enviado correctamente.', 'success');
    }
  });
}




cerrarPantallaCompleta() {
  this.tablaExpandida = false;
}
  // ---------------- ESTUDIANTES ----------------
  verEstudiantes(idActividad: string) {
    this.actividadesService.obtenerInscritos(idActividad).subscribe(inscritos => {
      this.estudiantes = inscritos;
      this.mostrarEstudiantes = true;
    });
  }

  cerrarEstudiantes() {
    this.mostrarEstudiantes = false;
    this.estudiantes = [];
  }

  async cancelarInscripcionAdmin(estudiante: any) {
  if (!estudiante.correo || !estudiante.idActividad) return;

  try {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la inscripción de ${estudiante.nombre} y se liberará el cupo.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    const inscripcionesRef = collection(this.firestore, 'inscripciones');
    const q = query(
      inscripcionesRef,
      where('correo', '==', estudiante.correo),
      where('idActividad', '==', estudiante.idActividad)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      Swal.fire('Error', 'No se encontró la inscripción para cancelar.', 'error');
      return;
    }

    for (const inscripcion of querySnapshot.docs) {
      await deleteDoc(doc(this.firestore, 'inscripciones', inscripcion.id));
    }

    // Actualizar cupo de la actividad
    const actRef = doc(this.firestore, 'actividades', estudiante.idActividad);
    const actSnap = await getDoc(actRef);
    if (actSnap.exists()) {
      const actividad = actSnap.data();
      const nuevoCupo = (actividad['cupo'] || 0) + 1;
      await updateDoc(actRef, { cupo: nuevoCupo });
    }

    Swal.fire('Cancelada', `La inscripción de ${estudiante.nombre} ha sido cancelada.`, 'success');

    // Refresca lista de estudiantes inscritos
    if (this.actividadSeleccionada) {
      this.verInscritos(this.actividadSeleccionada.id!);
    }

  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'No se pudo cancelar la inscripción.', 'error');
  }
}



cambiarEstado(estudiante: any, nuevoEstado: EstadoInscripcion, mensaje?: string) {
  if (!estudiante.id) return;

  const estadoConMensaje = mensaje ? `${nuevoEstado}: ${mensaje}` : nuevoEstado;

  this.actividadesService.actualizarInscripcion(estudiante.id, {
    estadoInscripcion: estadoConMensaje
  }).then(() => {
    estudiante.estadoInscripcion = estadoConMensaje;
  }).catch(err => {
    console.error('Error al actualizar el estado', err);
    Swal.fire('Error', 'No se pudo actualizar el estado del estudiante', 'error');
  });
}


  // ---------------- ACTIVIDADES ----------------
  cargarActividades() {
    this.actividadesService.obtenerActividades().subscribe(data => {
      const hoyStr = this.getFechaLocal(); // "YYYY-MM-DD"
      this.actividades = data.filter(act => act.fecha >= hoyStr);
    });
  }

  abrirModal(editar?: Actividad) {
    if (editar) {
      this.nuevaActividad = { ...editar };
      this.modoEdicion = true;
    } else {
      this.nuevaActividad = this.resetActividad();
      this.modoEdicion = false;
    }
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  crearActividad(form: NgForm) {
    if (!form.valid) {
      Swal.fire('Error', 'Todos los campos son obligatorios excepto descripción.', 'error');
      return;
    }

    if (this.nuevaActividad.fecha < this.hoy) {
      Swal.fire('Error', 'La fecha no puede ser menor que hoy.', 'error');
      return;
    }

    if (this.modoEdicion && this.nuevaActividad.id) {
      this.actividadesService.actualizarActividad(this.nuevaActividad.id, this.nuevaActividad).then(() => {
        Swal.fire('Actualizado', 'Actividad actualizada correctamente.', 'success');
        this.cargarActividades(); // refresca lista
        this.cerrarModal();
      });
    } else {
      this.actividadesService.agregarActividad(this.nuevaActividad).then(() => {
        Swal.fire('Creado', 'Actividad creada correctamente.', 'success');
        this.cargarActividades(); // refresca lista
        this.cerrarModal();
      });
    }
  }

  toggleEstado(act: Actividad) {
    if (!act.id) return;
    const nuevoEstado = !act.estado;
    this.actividadesService.actualizarActividad(act.id, { estado: nuevoEstado }).then(() => {
      act.estado = nuevoEstado;
    });
  }

  toggleVisible(act: Actividad) {
    if (!act.id) return;
    const nuevoVisible = !act.visible;
    this.actividadesService.actualizarActividad(act.id, { visible: nuevoVisible }).then(() => {
      act.visible = nuevoVisible;
    });
  }

  editarActividad(act: Actividad) {
    this.abrirModal(act);
  }

  eliminarActividad(id?: string) {
    if (!id) return;
    this.actividadesService.eliminarActividad(id).then(() => {
      this.cargarActividades(); // refresca lista
    });
  }

  verInscritos(id?: string) {
    if (!id) return;
    this.actividadSeleccionada = this.actividades.find(a => a.id === id) || null;
    if (!this.actividadSeleccionada) return;

    this.actividadesService.obtenerInscritos(id).subscribe(inscritos => {
      this.inscritosPorActividad[id] = inscritos;
      this.mostrarInscritos = true;
    });
  }

  get inscritos(): any[] {
    if (!this.actividadSeleccionada?.id) return [];
    return this.inscritosPorActividad[this.actividadSeleccionada.id] || [];
  }

  cerrarInscritos() {
    this.mostrarInscritos = false;
    this.actividadSeleccionada = null;
  }

  resetForm() {
    this.nuevaActividad = this.resetActividad();
    this.modoEdicion = false;
  }

  resetActividad(): Actividad {
    return {
      nombre: '',
      fecha: '',
      hora: '',
      lugar: '',
      horas: 0,
      cupo: 0,
      pago: false,
      descripcion: '',
      imagen: '',
      estado: true,
      visible: true,
    };
  }
}
