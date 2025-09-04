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
    // 🔥 Filtrar solo las actividades activas y visibles
    this.actividades = data.filter((act: any) => act.estado === true && act.visible === true);
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
    fechaAct = new Date(act.fecha + 'T00:00:00');
  }

  const fechaActNormalizada = this.fechaSinHora(fechaAct);
  const esMismoDia = fechaActNormalizada.getTime() === diaNormalizado.getTime();

  if (!esMismoDia) return false;

  if (this.filtro === 'futuras') {
    const hoy = this.fechaSinHora(new Date());
    if (fechaActNormalizada.getTime() < hoy.getTime()) return false;
  }

       return act.estado === true && act.visible === true;
    });
  }

  seleccionarActividad(dia: Date) {
  if (isNaN(dia.getTime())) return;

  const actividadesDia = this.actividadesDelDia(dia);
  if (!actividadesDia.length) return;

  if (actividadesDia.length === 1) {
    // 👉 Solo una actividad → mostrar normal
    this.mostrarModalActividad(actividadesDia[0]);
  } else {
    // 👉 Varias actividades → mostrar lista y elegir
    const listaHtml = actividadesDia.map((act, index) => `
      <button style="display:block;width:100%;margin:5px 0;padding:10px;border-radius:8px;border:1px solid #ccc;background:#641010ff; color: white;" 
              onclick="window.seleccionarActividad(${index})">
        ${act.nombre} - ${new Date(act.fecha).toLocaleDateString()}
      </button>
    `).join('');

    Swal.fire({
      title: 'Actividades disponibles',
      html: `<div>${listaHtml}</div>`,
      showConfirmButton: false,
    });

    // 👉 Truco para comunicar SweetAlert con Angular
    (window as any).seleccionarActividad = (index: number) => {
      Swal.close();
      this.mostrarModalActividad(actividadesDia[index]);
    };
  }
}

mostrarModalActividad(actividad: any) {
  let fechaActividad: Date;
  if (actividad.fecha instanceof Timestamp) {
    fechaActividad = actividad.fecha.toDate();
  } else {
    fechaActividad = new Date(actividad.fecha + 'T00:00:00');
  }

  const hoyNormalizado = this.fechaSinHora(new Date());
  const fechaActividadNormalizada = this.fechaSinHora(fechaActividad);

  const actividadPasada = fechaActividadNormalizada < hoyNormalizado;

  Swal.fire({
    title: actividad.titulo || actividad.nombre || 'Actividad',
    html: `
      <div style="text-align:center; margin-bottom:15px;">
        <!-- Loader -->
        <div id="loader" style="border: 4px solid #f3f3f3; border-top: 4px solid #641010ff; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto;"></div>

        <!-- Imagen (oculta hasta que cargue) -->
        <img id="actividad-img"
             src="${actividad.imagen || 'https://ceutec.hn/wp-content/uploads/2023/11/Premio-Fundahrse-2.png'}"
             alt="Imagen de la actividad"
             style="display:none; max-width:100%; border-radius:8px; margin-top:10px;" />
      </div>

      <div style="text-align:left; font-family:Arial, sans-serif; line-height:1.6;">
        <p><strong>📅 Fecha:</strong> ${fechaActividadNormalizada.toLocaleDateString()}</p>
        <p><strong>📍 Lugar:</strong> ${actividad.lugar}</p>
        <p><strong>👥 Cupo:</strong> ${actividad.cupo}</p>
        <p><strong>⏰ Horas:</strong> ${actividad.horas}</p>
        <p><strong>💰 Requiere pago:</strong> ${actividad.pago ? 'Sí' : 'No'}</p>
        ${actividad.descripcion ? `<p style="margin-top:12px;">${actividad.descripcion}</p>` : ''}
        ${actividadPasada ? '<p style="color:#b71c1c; font-weight:bold; margin-top:15px;">⚠️ Esta actividad ya no está disponible</p>' : ''}
      </div>

      <style>
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      </style>
    `,
    showCancelButton: true,
    showConfirmButton: !actividadPasada,
    confirmButtonText: 'Inscribirse',
    confirmButtonColor: '#001f3f',  // azul marino
    cancelButtonText: actividadPasada ? 'Cerrar' : 'Cancelar',
    cancelButtonColor: '#800020',   // rojo vino
    width: '500px',
    background: '#fdfdfd',
    didRender: () => {
      const img: any = document.getElementById("actividad-img");
      const loader = document.getElementById("loader");

      if (img) {
        img.onload = () => {
          if (loader) loader.style.display = "none";
          img.style.display = "block";
        };
      }
    }
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

esDiaValido(dia: Date): boolean {
  return dia instanceof Date && !isNaN(dia.getTime());
}



  fechaIgual(fechaStr: any, dia: Date): boolean {
    let f: Date;
if (fechaStr instanceof Timestamp) {
  f = fechaStr.toDate();
} else {
  f = new Date(fechaStr + 'T00:00:00');
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