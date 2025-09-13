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
  private correo!: string;

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

    // 📌 Ahora trabajamos con el correo
    this.correo = usuario.correo;

    this.cargarHistorial();
  }

  private cargarHistorial() {
    const asistenciasRef = collection(this.firestore, 'asistencias');
    const qAsistencias = query(asistenciasRef, where('correo', '==', this.correo));

    collectionData(qAsistencias, { idField: 'id' }).subscribe((asistencias: any[]) => {
      console.log('Asistencias:', asistencias); // debug

      this.actividadesService.obtenerActividades().subscribe((actividades: Actividad[]) => {
        console.log('Actividades:', actividades); // debug

        this.historialActividades = asistencias.map(asistencia => {
          const act = actividades.find(a => a.id === asistencia.idActividad);
          return {
            nombre: act ? act.nombre : 'Actividad no encontrada',
            fecha: act ? act.fecha : '',
            horas: act ? act.horas : 0,
            estado: asistencia.asistio ? 'Completada' : 'No asistió'
          };
        });

        console.log('Historial generado:', this.historialActividades); // debug
      });
    });
  }

  cerrarSesion() {
    this.router.navigate(['/']);
  }
}