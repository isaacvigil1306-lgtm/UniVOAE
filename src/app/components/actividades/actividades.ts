import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

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

  actividades: Actividad[] = [];
  nuevaActividad: Actividad = this.resetActividad();
  modalAbierto = false;
  modoEdicion = false;
  estudiantes: any[] = [];
  mostrarEstudiantes = false;

  actividadSeleccionada: Actividad | null = null;
  mostrarInscritos = false;
  inscritosPorActividad: { [key: string]: any[] } = {};

  constructor(private actividadesService: ActividadesService) {}

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

  cambiarEstado(estudiante: any, nuevoEstado: EstadoInscripcion) {
    if (!estudiante.id) return;

    this.actividadesService.actualizarInscripcion(estudiante.id, {
      estadoInscripcion: nuevoEstado
    }).then(() => {
      estudiante.estadoInscripcion = nuevoEstado;
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
