import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { ActividadesService, Actividad } from '../../servicios/actividades';

@Component({
  selector: 'app-actividades',
  standalone: true,
  templateUrl: './actividades.html',
  styleUrls: ['./actividades.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class Actividades implements OnInit {
  hoy: string = new Date().toISOString().split('T')[0];

  actividades: Actividad[] = [];
  nuevaActividad: Actividad = this.resetActividad();
  modalAbierto = false;
  modoEdicion = false;

  actividadSeleccionada: Actividad | null = null;
  mostrarInscritos = false;
  inscritosPorActividad: { [key: string]: any[] } = {};

  constructor(private actividadesService: ActividadesService) {}

  ngOnInit() {
    this.cargarActividades();
  }

  cargarActividades() {
    this.actividadesService.obtenerActividades().subscribe(data => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      this.actividades = data.filter(act => {
        const fechaAct = new Date(act.fecha);
        fechaAct.setHours(0, 0, 0, 0);
        return fechaAct >= hoy;
      });
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
        this.cerrarModal();
      });
    } else {
      this.actividadesService.agregarActividad(this.nuevaActividad).then(() => {
        Swal.fire('Creado', 'Actividad creada correctamente.', 'success');
        this.cerrarModal();
      });
    }
  }

  editarActividad(act: Actividad) {
    this.abrirModal(act);
  }

  eliminarActividad(id?: string) {
    if (!id) return;
    this.actividadesService.eliminarActividad(id);
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
      descripcion: ''
    };
  }
}
