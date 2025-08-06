import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class Registro {
  actividades = [
    { id: 1, nombre: 'Reforestación en el parque' },
    { id: 2, nombre: 'Jornada de limpieza' },
  ];

  inscritosPorActividad: { [actividadId: number]: any[] } = {
    1: [
      { nombre: 'Juan Pérez', identidad: '0801-1990-12345', estado: 'Pendiente' },
      { nombre: 'María López', identidad: '0801-1992-67890', estado: 'Pendiente' },
    ],
    2: [
      { nombre: 'Carlos Martínez', identidad: '0801-1988-54321', estado: 'Pendiente' },
    ]
  };

  actividadSeleccionadaId: number | null = null;

  seleccionarActividad(event: Event) {
    const select = event.target as HTMLSelectElement;
    const valor = select.value;
    this.actividadSeleccionadaId = valor ? +valor : null;
  }

  marcarCompletado(estudiante: any) {
    estudiante.estado = 'Validado';
  }
constructor(private router: Router) {}

cerrarSesion() {
  
  this.router.navigate(['/']);
}
  
}