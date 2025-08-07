import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historial',
  standalone: true,
  templateUrl: './historial.html',
  styleUrls: ['./historial.scss'],
  imports: [CommonModule, RouterModule],
})
export class Historial {
   estudiante = 'David Salvador'; 
  historialActividades = [
    {
      nombre: 'Reforestación en el parque',
      fecha: '2025-07-20',
      horas: 5,
      estado: 'Validado',
    },
    {
      nombre: 'Jornada de limpieza',
      fecha: '2025-07-10',
      horas: 4,
      estado: 'Pendiente',
    },
    {
      nombre: 'Voluntariado en hospital',
      fecha: '2025-06-25',
      horas: 6,
      estado: 'Rechazado',
    },
  ];
constructor(private router: Router) {}

cerrarSesion() {
  
  this.router.navigate(['/']);
}
  
}