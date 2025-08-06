import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-administrador',
  standalone: true,
  templateUrl: './administrador.html',
  styleUrls: ['./administrador.scss'],
  imports: [CommonModule, RouterModule],
})
export class Administrador {
  totalActividades = 12;
  totalEstudiantes = 85;

  horasPorMes = [
    { mes: 'Enero', horas: 40 },
    { mes: 'Febrero', horas: 35 },
    { mes: 'Marzo', horas: 50 },
    { mes: 'Abril', horas: 60 },
    { mes: 'Mayo', horas: 30 },
    { mes: 'Junio', horas: 45 },
    { mes: 'Julio', horas: 55 },
  ];
constructor(private router: Router) {}

cerrarSesion() {
  
  this.router.navigate(['/']);
}
  
}
