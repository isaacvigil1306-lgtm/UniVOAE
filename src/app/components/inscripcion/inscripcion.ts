import { Component, OnInit } from '@angular/core';
import { CommonModule,NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Firestore, doc, getDocs, getDoc, collection, addDoc, updateDoc, query, where
} from '@angular/fire/firestore';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

// 👇 importa tu servicio de usuarios (mismo nombre de archivo que ya usas)
import { UsuariosService } from '../../servicios/usuarios';

@Component({
  selector: 'app-inscripcion',
  standalone: true,
  templateUrl: './inscripcion.html',
  styleUrls: ['./inscripcion.scss'],
  imports: [CommonModule, FormsModule, RouterModule,NgIf],
})
export class Inscripcion implements OnInit {
  // formulario
  nombre = '';
  numeroCuenta = '';
  correo = '';
  telefono = '';
  comprobante: File | null = null;
  identidad = '';


  // estado UI
  enviado = false;
  mostrarModalPago = false;
  perfilEncontrado = false;

  // actividad
  idActividad!: string;
  actividad: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private usuariosService: UsuariosService
  ) {}

  async ngOnInit() {
    // 1) id de actividad desde query param
    this.idActividad = this.route.snapshot.queryParamMap.get('idActividad') || '';
    if (!this.idActividad) {
      Swal.fire('Sin actividad', 'No se encontró la actividad.', 'warning');
      this.router.navigate(['/calendario']);
      return;
    }

    // 2) leer usuario desde localStorage (solo para obtener correo)
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      Swal.fire('Sesión requerida', 'Debes iniciar sesión.', 'info');
      this.router.navigate(['/calendario']);
      return;
    }

    const usuarioLocal = JSON.parse(usuarioGuardado);
    const correoLocal = usuarioLocal?.correo || '';

    // 3) buscar perfil en Firestore por correo y autocompletar si existe
    if (correoLocal) {
      this.usuariosService.obtenerUsuarioPorCorreo(correoLocal).subscribe((usuarios) => {
        if (usuarios && usuarios.length > 0) {
          const u: any = usuarios[0];
          this.nombre = u.nombre || '';
          this.numeroCuenta = u.numeroCuenta || '';
          this.correo = u.correo ;
          this.identidad= u.identidad || '';
          this.telefono = u.telefono || '';
          this.perfilEncontrado = true; // bloquea edición de los campos base
        } else {
          // no hay perfil → campos editables y vacíos (correo sugerido)
          this.correo = correoLocal;
          this.perfilEncontrado = false;
        }
      });
    }

    // 4) cargar actividad
    const actRef = doc(this.firestore, 'actividades', this.idActividad);
    const actSnap = await getDoc(actRef);
    if (actSnap.exists()) {
      this.actividad = actSnap.data();
    } else {
      Swal.fire('Sin actividad', 'La actividad no existe.', 'error');
      this.router.navigate(['/calendario']);
    }
  }

  onFileChange(event: any) {
    const file = event.target.files?.[0];
    this.comprobante = file ?? null;
  }

  async enviarInscripcion() {
   if (!this.nombre || !this.numeroCuenta || !this.correo || !this.identidad) {
  Swal.fire('Campos requeridos', 'Completa los campos en el perfil de inicio para poder inscribirte.', 'warning');
  return;
}


    try {
      const inscripcionesRef = collection(this.firestore, 'inscripciones');

      // Evitar duplicados por numeroCuenta + idActividad
      const qIns = query(
        inscripcionesRef,
        where('correo', '==', this.correo),
        where('idActividad', '==', this.idActividad)
      );
      const querySnapshot = await getDocs(qIns);

      if (!querySnapshot.empty) {
        Swal.fire('Ya inscrito', 'No puedes inscribirte más de una vez en esta actividad.', 'info');
        return;
      }

      // Guardar inscripción
     await addDoc(inscripcionesRef, {
  idActividad: this.idActividad,
  nombre: this.nombre,
  numeroCuenta: this.numeroCuenta,
  correo: this.correo,
  telefono: this.telefono || null,
  identidad: this.identidad, // 📌 Aquí guardas la identidad
  estadoInscripcion: 'pendiente',
  fechaInscripcion: new Date()
});


      // Restar cupo (si el campo existe)
      if (this.actividad?.cupo !== undefined) {
        const actRef = doc(this.firestore, 'actividades', this.idActividad);
        await updateDoc(actRef, { cupo: (this.actividad.cupo || 0) - 1 });
      }

      this.enviado = true;

      // Mostrar modal solo si requiere pago
      if (this.actividad?.pago === true) {
        this.mostrarModalPago = true;
      } else {
        this.mostrarModalPago = false;
      }

      Swal.fire('Inscripción exitosa', 'Tu inscripción ha sido registrada.', 'success');
    } catch (error) {
      console.error('Error al guardar inscripción', error);
      Swal.fire('Error', 'Ocurrió un problema al inscribirse.', 'error');
    }
  }
irCalendario() {
  this.router.navigate(['/calendario']); // Ajusta la ruta según tu proyecto
}

  cerrarModalPago() {
    this.mostrarModalPago = false;
  }

  mailtoLink() {
    if (!this.actividad) return '#';
    const subject = `Comprobante de pago - ${this.actividad.nombre}`;
    const body =
      `No elimine la siguiente información:\n\n` +
      `Nombre de la actividad: ${this.actividad.nombre}\n` +
      `Nombre del alumno: ${this.nombre}\n` +
      `Número de cuenta (alumno): ${this.numeroCuenta}\n\n` +
      `Adjunte su comprobante de pago, por favor.`;

    const correoPago = this.actividad.correoPago || 'pagos@ejemplo.com';
    return `mailto:${correoPago}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  cerrarSesion() {
    this.router.navigate(['/']);
  }
}
