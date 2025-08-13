import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

import { ActividadesService, Actividad } from '../../servicios/actividades';

@Component({
  selector: 'app-actividades',
  standalone: true,
  templateUrl: './actividades.html',
  styleUrls: ['./actividades.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class Actividades implements OnInit {
  actividades: Actividad[] = [];
  nuevaActividad: Actividad = this.resetActividad();
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
      this.actividades = data;
    });
  }

  crearActividad() {
    if (this.modoEdicion && this.nuevaActividad.id) {
      this.actividadesService.actualizarActividad(this.nuevaActividad.id, this.nuevaActividad).then(() => {
        this.resetForm();
      });
    } else {
      this.actividadesService.agregarActividad(this.nuevaActividad).then(() => {
        this.resetForm();
      });
    }
  }

  editarActividad(act: Actividad) {
    this.nuevaActividad = { ...act };
    this.modoEdicion = true;
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

  cerrarSesion() {
    // Aquí deberías implementar la lógica para cerrar sesión con Firebase Auth
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