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

  // ---------------- FECHA LOCAL ----------------
  getFechaLocal(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  // ---------------- CARGAR ACTIVIDADES ----------------
  cargarActividades() {
    this.actividadesService.obtenerActividades().subscribe((actividades: Actividad[]) => {
      const hoy = this.getFechaLocal();

      this.actividadesHoy = actividades.filter(a => a.fecha === hoy);
      this.actividadesProximas = actividades.filter(a => a.fecha > hoy);
      this.actividadesPasadas = actividades.filter(a => a.fecha < hoy);
    });
  }

  verEstudiantes(act: Actividad) {
    if (!act.id) return;
    this.router.navigate(['/actividadespasadas'], { queryParams: { idActividad: act.id } });
  }
}
