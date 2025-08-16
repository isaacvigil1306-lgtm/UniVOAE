import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { ActividadesService, Actividad } from '../../servicios/actividades';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './historial.html',
  styleUrls: ['./historial.scss']
})
export class Historial implements OnInit {
  historialActividades: Array<{ nombre: string; fecha: string; horas: number; estado: string }> = [];
  private identidad!: string;

  constructor(
    private firestore: Firestore,
    private actividadesService: ActividadesService,
    private router: Router
  ) {}

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      this.router.navigate(['/']);
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    this.identidad = usuario.dni;

    this.cargarHistorial();
  }

  private cargarHistorial() {
  const asistenciasRef = collection(this.firestore, 'asistencias');
  const qAsistencias = query(asistenciasRef, where('identidad', '==', this.identidad));

  collectionData(qAsistencias, { idField: 'id' }).subscribe((asistencias: any[]) => {
    this.actividadesService.obtenerActividades().subscribe((actividades: Actividad[]) => {
      this.historialActividades = asistencias.map(asistencia => {
        const act = actividades.find(a => a.id === asistencia.idActividad);
        return {
          nombre: act ? act.nombre : 'Actividad no encontrada',
          fecha: act ? act.fecha : '',
          horas: act ? act.horas : 0,
          estado: asistencia.asistio ? 'Completada' : 'No asistió'
        };
      });
    });
  });
}




cerrarSesion() {
  
  this.router.navigate(['/']);
}
  
}