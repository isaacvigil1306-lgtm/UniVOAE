
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActividadesService, Actividad } from '../../servicios/actividades';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-actividadespasadas',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './actividadespasadas.html',
  styleUrl: './actividadespasadas.scss'
})
export class Actividadespasadas {
  actividades: any[] = [];
  busqueda = '';
  actividadSeleccionada: any = null;

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    const hoy = new Date().toISOString().split('T')[0];
    const q = query(collection(this.firestore, 'actividades'), where('fecha', '<', hoy));
    const snap = await getDocs(q);

    this.actividades = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async abrirModalEstudiantes(actividad: any) {
    // Si ya cargó estudiantes antes, no vuelve a consultar
    if (!actividad.estudiantes) {
      const q = query(collection(this.firestore, 'asistencias'), where('idActividad', '==', actividad.id));
      const snap = await getDocs(q);
      actividad.estudiantes = snap.docs.map(doc => doc.data());
    }

    this.actividadSeleccionada = actividad;
  }

  cerrarModal() {
    this.actividadSeleccionada = null;
  }

  actividadesFiltradas() {
    if (!this.busqueda) return this.actividades;
    const texto = this.busqueda.toLowerCase();
    return this.actividades.filter(
      a =>
        a.nombre.toLowerCase().includes(texto) ||
        a.estudiantes?.some(
          (est: any) =>
            est.nombre.toLowerCase().includes(texto) || est.identidad.includes(texto)
        )
    );
  }
}
