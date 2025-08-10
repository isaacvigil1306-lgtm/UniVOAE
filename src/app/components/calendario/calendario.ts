import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-calendario',
  standalone: true,
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.scss'],
  imports: [CommonModule, RouterModule, FormsModule],
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
    },
    {
      id: 4,
      titulo: 'Pintado de aulas',
      fecha: '2025-08-02',
      lugar: 'Escuela Peniel',
      cupo: 40,
      horas: 10,
      pago: false
    }
  ];

  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarioDias: Date[] = [];

  mesActual: number;
  anioActual: number;

  actividadSeleccionada: any = null;

  constructor(private router: Router) {
    const hoy = new Date();
    this.mesActual = hoy.getMonth();
    this.anioActual = hoy.getFullYear();
    this.generarCalendario();
  }

  generarCalendario() {
    const primerDiaMes = new Date(this.anioActual, this.mesActual, 1);
    const ultimoDiaMes = new Date(this.anioActual, this.mesActual + 1, 0);

    const primerDiaSemana = primerDiaMes.getDay();
    const totalDias = ultimoDiaMes.getDate();

    this.calendarioDias = [];

    // Días vacíos al inicio
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

  tieneActividad(dia: Date): boolean {
    if (isNaN(dia.getTime())) return false;
    return this.actividades.some(act => this.fechaIgual(act.fecha, dia));
  }

  actividadesDelDia(dia: Date) {
  if (isNaN(dia.getTime())) return [];

  return this.actividades.filter(act => {
    const fechaAct = new Date(act.fecha);

    const esMismoDia =
      fechaAct.getFullYear() === dia.getFullYear() &&
      fechaAct.getMonth() === dia.getMonth() &&
      fechaAct.getDate() === dia.getDate();

    if (!esMismoDia) return false;

    if (this.filtro === 'futuras') {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return fechaAct >= hoy;
    }

    return true;
  });
}


  seleccionarActividad(dia: Date) {
  if (isNaN(dia.getTime())) return;

  const actividad = this.actividades.find(act => this.fechaIgual(act.fecha, dia));
  if (!actividad) return;

  const fechaActividad = new Date(actividad.fecha);
const hoy = new Date();

// Establecemos solo la parte de la fecha (sin horas)
fechaActividad.setHours(0, 0, 0, 0);
hoy.setHours(0, 0, 0, 0);

// Verificamos si la actividad ya pasó
const actividadPasada = fechaActividad < hoy;
Swal.fire({
  title: actividad.titulo,
  html: `
    <p><strong>Fecha:</strong> ${actividad.fecha}</p>
    <p><strong>Lugar:</strong> ${actividad.lugar}</p>
    <p><strong>Cupo:</strong> ${actividad.cupo}</p>
    <p><strong>Horas:</strong> ${actividad.horas}</p>
    <p><strong>Requiere pago:</strong> ${actividad.pago ? 'Sí' : 'No'}</p>
    ${actividadPasada ? '<p style="color:red;"><strong>Esta actividad no esta disponible</strong></p>' : ''}
  `,
  showCancelButton: !actividadPasada,
  showConfirmButton: !actividadPasada,
  confirmButtonText: 'Inscribirse',
  confirmButtonColor: '#28a745',
  cancelButtonText: 'Cerrar',
  cancelButtonColor: '#dc3545'
}).then(resultado => {
  if (resultado.isConfirmed && !actividadPasada) {
    this.router.navigate(['/inscripcion']);
  }
});}

  fechaIgual(fechaStr: string, dia: Date): boolean {
    const f = new Date(fechaStr);
    return f.getFullYear() === dia.getFullYear() &&
           f.getMonth() === dia.getMonth() &&
           f.getDate() === dia.getDate();
  }

  cerrarSesion() {
    this.router.navigate(['/']);
  }
  filtro: 'todas' | 'futuras' = 'todas';
hoy: Date = new Date();

irAHoy() {
  this.mesActual = this.hoy.getMonth();
  this.anioActual = this.hoy.getFullYear();
  this.generarCalendario();
}

esHoy(dia: Date): boolean {
  if (isNaN(dia.getTime())) return false;
  const hoy = new Date();
  return (
    dia.getFullYear() === hoy.getFullYear() &&
    dia.getMonth() === hoy.getMonth() &&
    dia.getDate() === hoy.getDate()
  );
}

esPasado(dia: Date): boolean {
  if (isNaN(dia.getTime())) return false;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return dia < hoy;
}

}
