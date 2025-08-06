import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendario',
  standalone: true,
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.scss'],
  imports: [CommonModule, RouterModule],
})
export class Calendario {
  actividades = [
    {
      id: 1,
      titulo: 'Reforestación en el parque',
      fecha: '2025-08-10',
      lugar: 'Parque Central',
      cupo: 30,
      horas: 5,
      pago: false
    },
    {
      id: 2,
      titulo: 'Jornada de limpieza',
      fecha: '2025-08-15',
      lugar: 'Río Choluteca',
      cupo: 20,
      horas: 4,
      pago: false
    },
    {
      id: 3,
      titulo: 'Evento cultural',
      fecha: '2025-08-20',
      lugar: 'Casa de la Cultura',
      cupo: 50,
      horas: 3,
      pago: true
    }
  ];

  fechaSeleccionada: string | null = null;
  actividadSeleccionada: any = null;

  seleccionarActividad(fecha: string) {
    this.fechaSeleccionada = fecha;
    this.actividadSeleccionada = this.actividades.find(act => act.fecha === fecha);
  }

  irAInscripcion() {

  }
constructor(private router: Router) {}

cerrarSesion() {
  
  this.router.navigate(['/']);
}
  
}
