import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-principal',
  standalone: true,
  templateUrl: './principal.html',
  styleUrls: ['./principal.scss'],
  imports: [CommonModule, RouterModule],
})
export class Principal {
estudiante: string = ''; 

  actividadesProximas = [
    { titulo: 'Reforestación en el parque', fecha: '10/08/2025', lugar: 'Parque Central' },
    { titulo: 'Jornada de limpieza', fecha: '15/08/2025', lugar: 'Río Choluteca' },
  ];

  horasAcumuladas = 40;
  horasPendientes = 20;

  ultimaActividad = {
    titulo: 'Voluntariado en hogar de ancianos',
    fecha: '01/08/2025'
  };

  constructor(private router: Router) {}

  ngOnInit() {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.estudiante = usuario.nombre || 'Usuario';
    } else {
      this.estudiante = 'Usuario';
    }
  }

  cerrarSesion() {
    this.router.navigate(['/']);
  }
}