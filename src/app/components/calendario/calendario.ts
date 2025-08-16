import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Timestamp } from 'firebase/firestore';


@Component({
  selector: 'app-calendario',
  standalone: true,
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.scss'],
  imports: [CommonModule, RouterModule, FormsModule],
})
export class Calendario implements OnInit {
   actividades: any[] = [];
  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarioDias: Date[] = [];

  mesActual: number;
  anioActual: number;

  actividadSeleccionada: any = null;
  filtro: 'todas' | 'futuras' = 'todas';
  hoy: Date = new Date();

  constructor(private firestore: Firestore, private router: Router) {
    const hoy = new Date();
    this.mesActual = hoy.getMonth();
    this.anioActual = hoy.getFullYear();
  }

  ngOnInit() {
    this.cargarActividades();
    this.generarCalendario();
  }

  cargarActividades() {
    const actividadesRef = collection(this.firestore, 'actividades');
    collectionData(actividadesRef, { idField: 'id' }).subscribe(data => {
      this.actividades = data;
      this.generarCalendario();
    });
  }

  generarCalendario() {
    const primerDiaMes = new Date(this.anioActual, this.mesActual, 1);
    const ultimoDiaMes = new Date(this.anioActual, this.mesActual + 1, 0);

    const primerDiaSemana = primerDiaMes.getDay();
    const totalDias = ultimoDiaMes.getDate();

    this.calendarioDias = [];

    // Días vacíos al inicio para ajustar la primera semana
    for (let i = 0; i < primerDiaSemana; i++) {
      this.calendarioDias.push(new Date(NaN));
    }

    // Días reales del mes
    for (let i = 1; i <= totalDias; i++) {
      this.calendarioDias.push(new Date(this.anioActual, this.mesActual, i));
    }
  }

  cambiarMes(direccion: number) {
    this.mesActual += direccion;

    if (this.mesActual > 11) {
      this.mesActual = 0;
      this.anioActual += 1;
    } else if (this.mesActual < 0) {
      this.mesActual = 11;
      this.anioActual -= 1;
    }

    this.actividadSeleccionada = null;
    this.generarCalendario();
  }

  obtenerNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes];
  }

  // Función para normalizar fechas sin horas ni minutos ni segundos
  fechaSinHora(fecha: Date): Date {
    const f = new Date(fecha);
    f.setHours(0, 0, 0, 0);
    return f;
  }

  tieneActividad(dia: Date): boolean {
    if (isNaN(dia.getTime())) return false;
    return this.actividades.some(act => this.fechaIgual(act.fecha, dia));
  }

  actividadesDelDia(dia: Date) {
    if (isNaN(dia.getTime())) return [];

    const diaNormalizado = this.fechaSinHora(dia);

    return this.actividades.filter(act => {
      let fechaAct: Date;

      if (act.fecha instanceof Timestamp) {
        fechaAct = act.fecha.toDate();
      } else {
        fechaAct = new Date(act.fecha);
      }

      const fechaActNormalizada = this.fechaSinHora(fechaAct);

      const esMismoDia = fechaActNormalizada.getTime() === diaNormalizado.getTime();

      if (!esMismoDia) return false;

      if (this.filtro === 'futuras') {
        const hoy = this.fechaSinHora(new Date());
        return fechaActNormalizada.getTime() >= hoy.getTime();
      }

      return true;
    });
  }

  seleccionarActividad(dia: Date) {
    if (isNaN(dia.getTime())) return;

    const actividad = this.actividades.find(act => this.fechaIgual(act.fecha, dia));
    if (!actividad) return;

    let fechaActividad: Date;
    if (actividad.fecha instanceof Timestamp) {
      fechaActividad = actividad.fecha.toDate();
    } else {
      fechaActividad = new Date(actividad.fecha);
    }

    const hoy = new Date();

    const fechaActividadNormalizada = this.fechaSinHora(fechaActividad);
    const hoyNormalizado = this.fechaSinHora(hoy);

    const actividadPasada = fechaActividadNormalizada < hoyNormalizado;

    Swal.fire({
  title: actividad.titulo || actividad.nombre || 'Actividad',
  html: `
    <p><strong>Fecha:</strong> ${fechaActividadNormalizada.toLocaleDateString()}</p>
    <p><strong>Lugar:</strong> ${actividad.lugar}</p>
    <p><strong>Cupo:</strong> ${actividad.cupo}</p>
    <p><strong>Horas:</strong> ${actividad.horas}</p>
    <p><strong>Requiere pago:</strong> ${actividad.pago ? 'Sí' : 'No'}</p>
    ${actividadPasada ? '<p style="color:red;"><strong>Esta actividad no está disponible</strong></p>' : ''}
  `,
  showCancelButton: !actividadPasada,
  showConfirmButton: !actividadPasada,
  confirmButtonText: 'Inscribirse',
  confirmButtonColor: '#001333',
  cancelButtonText: 'Cerrar',
  cancelButtonColor: '#dc3545'
}).then(resultado => {
  if (resultado.isConfirmed && !actividadPasada) {
    if (actividad.cupo > 0) {
      this.router.navigate(['/inscripcion'], { queryParams: { idActividad: actividad.id } });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Cupos llenos',
        text: 'Lo sentimos, esta actividad ya no tiene cupos disponibles.',
      });
    }
  }
});
  }

  fechaIgual(fechaStr: any, dia: Date): boolean {
    let f: Date;
    if (fechaStr instanceof Timestamp) {
      f = fechaStr.toDate();
    } else {
      f = new Date(fechaStr);
    }

    return this.fechaSinHora(f).getTime() === this.fechaSinHora(dia).getTime();
  }

  cerrarSesion() {
    this.router.navigate(['/']);
  }

  irAHoy() {
    this.mesActual = this.hoy.getMonth();
    this.anioActual = this.hoy.getFullYear();
    this.generarCalendario();
  }

  esHoy(dia: Date): boolean {
    if (isNaN(dia.getTime())) return false;

    return this.fechaSinHora(dia).getTime() === this.fechaSinHora(new Date()).getTime();
  }

  esPasado(dia: Date): boolean {
    if (isNaN(dia.getTime())) return false;

    const hoy = this.fechaSinHora(new Date());

    return dia < hoy;
  }
}