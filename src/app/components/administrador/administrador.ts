import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Actividad, ActividadesService } from '../../servicios/actividades';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './administrador.html',
  styleUrls: ['./administrador.scss'],
})
export class Administrador implements OnInit {
  actividadesHoy: Actividad[] = [];
  actividadesProximas: Actividad[] = [];
  actividadesPasadas: Actividad[] = [];

  constructor(private router: Router, private actividadesService: ActividadesService) {}

  ngOnInit() {
    this.cargarActividades();
  }

  cerrarSesion() {
    this.router.navigate(['/']);
  }

  cargarActividades() {
    this.actividadesService.obtenerActividades().subscribe((actividades) => {
      const hoy = new Date().toISOString().split('T')[0];

      this.actividadesHoy = actividades.filter(a => a.fecha === hoy);
      this.actividadesProximas = actividades.filter(a => a.fecha > hoy);
      this.actividadesPasadas = actividades.filter(a => a.fecha < hoy);
    });
  }

  verEstudiantes(act: Actividad) {
    // Redirigir a la página de registro o abrir modal
    this.router.navigate(['/actividadespasadas'], { queryParams: { idActividad: act.id } });
  }
}
