import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-actividades',
  standalone: true,
  templateUrl: './actividades.html',
  styleUrls: ['./actividades.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class Actividades {
  actividades = [
    {
      id: 1,
      nombre: 'Reforestación en el parque',
      fecha: '2025-08-10',
      hora: '08:00',
      lugar: 'Parque Central',
      horas: 5,
      cupo: 30,
      pago: false,
      descripcion: 'Plantación de árboles con voluntarios.'
    },
    {
      id: 2,
      nombre: 'Jornada de limpieza',
      fecha: '2025-08-15',
      hora: '09:00',
      lugar: 'Río Choluteca',
      horas: 4,
      cupo: 20,
      pago: false,
      descripcion: 'Limpieza del entorno del río.'
    }
  ];

  nuevaActividad: any = {
    nombre: '',
    fecha: '',
    hora: '',
    lugar: '',
    horas: 0,
    cupo: 0,
    pago: false,
    descripcion: ''
  };

  modoEdicion: boolean = false;
  idEditando: number | null = null;

  // inscritos por actividad
  inscritosPorActividad: { [actividadId: number]: any[] } = {
    1: [
      { nombre: 'Juan Pérez', identidad: '0801-1990-12345', correo: 'juan@mail.com' },
      { nombre: 'María López', identidad: '0801-1992-67890', correo: 'maria@mail.com' }
    ],
    2: [
      { nombre: 'Carlos Martínez', identidad: '0801-1988-54321', correo: 'carlos@mail.com' }
    ]
  };

  actividadSeleccionada: any = null;
  mostrarInscritos: boolean = false;

  crearActividad() {
    if (!this.nuevaActividad.nombre || !this.nuevaActividad.fecha || !this.nuevaActividad.hora || !this.nuevaActividad.lugar) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    if (this.modoEdicion) {
      const index = this.actividades.findIndex(a => a.id === this.idEditando);
      if (index !== -1) {
        this.actividades[index] = { ...this.nuevaActividad, id: this.idEditando };
      }
    } else {
      const nueva = { ...this.nuevaActividad, id: Date.now() };
      this.actividades.push(nueva);
    }
    this.resetFormulario();
  }

  editarActividad(actividad: any) {
    this.nuevaActividad = { ...actividad };
    this.modoEdicion = true;
    this.idEditando = actividad.id;
    this.mostrarInscritos = false; 
  }

  eliminarActividad(id: number) {
    if (confirm('¿Está seguro que desea eliminar esta actividad?')) {
      this.actividades = this.actividades.filter(a => a.id !== id);
      if (this.actividadSeleccionada?.id === id) {
        this.cerrarInscritos();
      }
      this.resetFormulario();
    }
  }

  verInscritos(id: number) {
    this.actividadSeleccionada = this.actividades.find(a => a.id === id);
    this.mostrarInscritos = true;
  }

  cerrarInscritos() {
    this.mostrarInscritos = false;
    this.actividadSeleccionada = null;
  }

  resetFormulario() {
    this.nuevaActividad = {
      nombre: '',
      fecha: '',
      hora: '',
      lugar: '',
      horas: 0,
      cupo: 0,
      pago: false,
      descripcion: ''
    };
    this.modoEdicion = false;
    this.idEditando = null;
  }
constructor(private router: Router) {}

cerrarSesion() {
  
  this.router.navigate(['/']);
}
  
}
