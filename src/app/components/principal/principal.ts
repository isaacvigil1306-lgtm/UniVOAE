import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ActividadesService, Actividad } from '../../servicios/actividades';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './principal.html',
  styleUrls: ['./principal.scss'],
})
export class Principal implements OnInit {
  estudiante: string = '';
  horasAcumuladas: number = 0;
  horasPendientes: number = 70;

  // Tu HTML espera .titulo y .fecha
  ultimaActividad: { titulo: string; fecha: string } = { titulo: 'Aún no has completado ninguna actividad', fecha: '' };

  // Tu HTML espera que cada item tenga { titulo, fecha, lugar }
  actividadesProximas: Array<{ titulo: string; fecha: string; lugar: string }> = [];

  // Identificadores del usuario logueado (desde localStorage)
  private identidad!: string; // dni
  private correo!: string;

  constructor(
    private router: Router,
    private actividadesService: ActividadesService,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    // 1) Sesión
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      this.router.navigate(['/']); // sin sesión -> login
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    // nombre para saludo (primer nombre + primer apellido si se puede)
    const partes = (usuario.nombre || '').trim().split(/\s+/);
    this.estudiante = (partes[0] && partes[1]) ? `${partes[0]} ${partes[1]}` : (usuario.nombre || usuario.username || 'Estudiante');

    // claves para consultar
    this.identidad = usuario.dni;     // en tus colecciones "inscripciones" y "asistencias" está "identidad"
    this.correo = usuario.correo;     // también está disponible por si lo necesitas más tarde

    // 2) Cargar datos
    this.cargarHorasYUltimaActividad();
    this.cargarActividadesProximas();
  }

  // --- HORAS y ÚLTIMA ACTIVIDAD (desde 'asistencias') ---
  private cargarHorasYUltimaActividad() {
    const asistenciasRef = collection(this.firestore, 'asistencias');
    const qAsist = query(asistenciasRef, where('identidad', '==', this.identidad));
    collectionData(qAsist, { idField: 'id' }).subscribe((asistencias: any[]) => {
      // Horas acumuladas
      const acumuladas = asistencias
        .filter(a => a.asistio === true)
        .reduce((sum, a) => sum + (Number(a.horasAcreditadas) || 0), 0);

      this.horasAcumuladas = acumuladas;
      this.horasPendientes = Math.max(0, 70 - this.horasAcumuladas);

      // Última actividad realizada (si hay)
      const completadas = asistencias.filter(a => a.asistio === true);
      if (completadas.length > 0) {
        // Normaliza fechaRegistro (puede ser string o Timestamp)
        const toDate = (f: any): Date => (f && typeof f.toDate === 'function') ? f.toDate() : new Date(f);

        const ultima = completadas.reduce((a, b) =>
          toDate(a.fechaRegistro) > toDate(b.fechaRegistro) ? a : b
        );

        // Buscar nombre/fecha en 'actividades'
        this.actividadesService.obtenerActividades().subscribe((acts: Actividad[]) => {
          const act = acts.find(x => x.id === ultima.idActividad);
          if (act) {
            this.ultimaActividad = { titulo: act.nombre, fecha: act.fecha };
          } else {
            // Si no se encuentra, dejamos mensaje genérico
            this.ultimaActividad = { titulo: 'Actividad registrada', fecha: '' };
          }
        });
      } else {
        this.ultimaActividad = { titulo: 'Aún no has completado ninguna actividad', fecha: '' };
      }
    });
  }

  // --- PRÓXIMAS ACTIVIDADES (desde 'inscripciones' + join con 'actividades') ---
  private cargarActividadesProximas() {
    const inscripcionesRef = collection(this.firestore, 'inscripciones');
    const qIns = query(inscripcionesRef, where('identidad', '==', this.identidad));
    collectionData(qIns, { idField: 'id' }).subscribe((inscripciones: any[]) => {
      // obtenemos todas las actividades y hacemos join por id
      this.actividadesService.obtenerActividades().subscribe((acts: Actividad[]) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const idsInscrito = new Set(inscripciones.map(i => i.idActividad));
        const proximas = acts.filter(act => {
          if (!idsInscrito.has(act.id!)) return false;
          const f = new Date(act.fecha);
          f.setHours(0, 0, 0, 0);
          return f >= hoy;
        });

        // adapta al HTML esperado (titulo, fecha, lugar)
        this.actividadesProximas = proximas.map(a => ({
          titulo: a.nombre,
          fecha: a.fecha,
          lugar: a.lugar
        }));
      });
    });
  }
}
