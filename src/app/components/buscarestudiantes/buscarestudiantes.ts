import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-buscarestudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIf, NgFor],
  templateUrl: './buscarestudiantes.html',
  styleUrls: ['./buscarestudiantes.scss']
})
export class Buscarestudiantes implements OnInit {
  
  busqueda = '';
  estudiantes: any[] = [];
  estudiantesFiltradosList: any[] = [];
  estudianteSeleccionado: any = null;

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.cargarEstudiantes();
    this.filtrarEstudiantes();
  }

  // ---------------- Cargar todos los estudiantes ----------------
async cargarEstudiantes() {
  const estudiantesRef = collection(this.firestore, 'usuarios');
  const snap = await getDocs(estudiantesRef);

  this.estudiantes = snap.docs
    .map(doc => ({ id: doc.id, ...(doc.data() as any) })) // 👈 Aquí le decimos que es any
    .filter(est => est.nombre && est.identidad); // 👈 Filtramos los que tienen nombre e identidad

  this.estudiantesFiltradosList = [...this.estudiantes];
}

  // ---------------- Filtrar estudiantes ----------------
  async filtrarEstudiantes() {
    const texto = this.busqueda.trim().toLowerCase();

    this.estudiantesFiltradosList = this.estudiantes.filter(est => {
      const nombre = est.nombre?.toLowerCase() || '';
      const identidad = est.identidad?.toLowerCase() || '';
      return nombre.includes(texto) || identidad.includes(texto);
    });

    if (this.estudiantesFiltradosList.length === 1) {
      const est = this.estudiantesFiltradosList[0];
      if (!this.estudianteSeleccionado || this.estudianteSeleccionado.id !== est.id) {
        await this.abrirModalEstudiante(est);
      }
    } else {
      this.estudianteSeleccionado = null;
    }
  }

  // ---------------- Abrir modal perfil ----------------
  async abrirModalEstudiante(estudiante: any) {
    this.estudianteSeleccionado = { ...estudiante, actividades: [], horasAcumuladas: 0 };

    const asistenciasRef = collection(this.firestore, 'asistencias');
    const q = query(asistenciasRef, where('correo', '==', estudiante.correo));
    const snap = await getDocs(q);

    let totalHoras = 0;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const actRef = collection(this.firestore, 'actividades');
      const actSnap = await getDocs(query(actRef, where('__name__', '==', data['idActividad'])));
      const actData = actSnap.docs[0]?.data() || {};

      const horas = data['horasAcreditadas'] || 0;
      totalHoras += horas;

      this.estudianteSeleccionado.actividades.push({
        nombre: actData['nombre'] || 'Actividad desconocida',
        fecha: actData['fecha'] || '-',
        lugar: actData['lugar'] || '-',
        horas,
        asistio: data['asistio'] || false
      });
    }

    this.estudianteSeleccionado.horasAcumuladas = totalHoras;
  }

  cerrarModal() {
    this.estudianteSeleccionado = null;
  }
}
