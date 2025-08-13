import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc, collection, addDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth'; // si usas autenticación
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inscripcion',
  standalone: true,
  templateUrl: './inscripcion.html',
  styleUrls: ['./inscripcion.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class Inscripcion implements OnInit {
  
  nombre: string = '';
  identidad: string = '';
  correo: string = '';
  telefono: string = '';
  comprobante: File | null = null;

  enviado: boolean = false;

  idActividad!: string;
  actividad: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private auth: Auth
  ) {}

  async ngOnInit() {
  // Obtener id de la actividad desde la URL
  this.idActividad = this.route.snapshot.queryParamMap.get('idActividad') || '';

  if (!this.idActividad) {
    alert('No se encontró la actividad');
    this.router.navigate(['/calendario']);
    return;
  }

  // Leer usuario guardado en localStorage
  const usuarioGuardado = localStorage.getItem('usuario');
  if (!usuarioGuardado) {
    alert('Debes iniciar sesión');
    this.router.navigate(['/calendario']);
    return;
  }

  const data = JSON.parse(usuarioGuardado);
  this.nombre = data.nombre || '';
  this.identidad = data.dni || '';
  this.correo = data.correo || '';

  // Obtener datos de la actividad
  const actRef = doc(this.firestore, 'actividades', this.idActividad);
  const actSnap = await getDoc(actRef);
  if (actSnap.exists()) {
    this.actividad = actSnap.data();
  }
}


  onFileChange(event: any) {
    const file = event.target.files[0];
    this.comprobante = file;
  }

  async enviarInscripcion() {
    if (!this.nombre || !this.identidad || !this.correo) {
      alert('Por favor, complete los campos requeridos.');
      return;
    }

    try {
      // Guardar inscripción
      await addDoc(collection(this.firestore, 'inscripciones'), {
        idActividad: this.idActividad,
        nombre: this.nombre,
        identidad: this.identidad,
        correo: this.correo,
        telefono: this.telefono,
        fechaInscripcion: new Date()
        
      });

      // Restar cupo de actividad
      const actRef = doc(this.firestore, 'actividades', this.idActividad);
      await updateDoc(actRef, {
        cupo: (this.actividad.cupo || 0) - 1
      });

      this.enviado = true;

      // Resetear teléfono y comprobante (los otros datos no)
      this.telefono = '';
      this.comprobante = null;

    } catch (error) {
      console.error('Error al guardar inscripción', error);
    }
  }

  cerrarSesion() {
    this.router.navigate(['/']);
  }
}
