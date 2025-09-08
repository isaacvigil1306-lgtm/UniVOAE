import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

import { ActividadesService, Actividad } from '../../servicios/actividades';
import { UsuariosService, Usuario } from '../../servicios/usuarios';
import { Firestore, collection, collectionData, doc, deleteDoc, query, where, getDocs,updateDoc, getDoc } from '@angular/fire/firestore';

type EstadoInscripcion = 'aceptado' | 'rechazado' | 'pendiente' | 'falta-pago';
type ActividadEstudiante = Actividad & { estadoInscripcion: EstadoInscripcion };

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './principal.html',
  styleUrls: ['./principal.scss'],
})
export class Principal implements OnInit {
  estudiante = '';
  horasAcumuladas = 0;
  horasPendientes = 70;
 mostrarModalPago = false;
  actividadPago: Actividad | null = null;
  nombreAlumno = '';
  numeroCuentaAlumno = '';
  correoAlumno = '';
  ultimaActividad: { titulo: string; fecha?: string } = { 
    titulo: 'Aún no has completado ninguna actividad' 
  };

  actividadesProximas: ActividadEstudiante[] = [];

  usuario: Usuario = {
    nombre: '',
    numeroCuenta: '',
    correo: '',
    telefono: '',
    identidad: '',
    carrera: ''
  };

  modoEdicion = true; // true = formulario visible, false = card visible

  estudiantes: { 
    id?: string; 
    identidad: string; 
    nombre: string; 
    correo: string; 
    estadoInscripcion: EstadoInscripcion; 
  }[] = [];

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private actividadesService: ActividadesService,
    private usuarios: UsuariosService,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      this.router.navigate(['/']);
      return;
    }

    const usuarioLocal: Partial<Usuario> = JSON.parse(usuarioGuardado);
    this.usuario.correo = usuarioLocal.correo || '';
    this.estudiante = this.usuario.correo.replace('@unitec.edu', '');

    this.usuarios.obtenerUsuarioPorCorreo(this.usuario.correo).subscribe((data: Usuario[]) => {
      this.ngZone.run(() => {
        if (data.length > 0) {
          this.usuario = data[0];
          this.estudiante = this.usuario.correo.replace('@unitec.edu', '');
          this.modoEdicion = false;
          localStorage.setItem('usuario', JSON.stringify(this.usuario));
        } else {
          this.modoEdicion = true;
        }

        this.cargarHorasYUltimaActividad();
        this.cargarActividadesProximas();
      });
    });
  }

  guardarUsuario(form: NgForm) {
    if (!form.valid) {
      Swal.fire('Error', 'Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    const identidadAnterior = JSON.parse(localStorage.getItem('usuario') || '{}').identidad;

    if (identidadAnterior && identidadAnterior !== this.usuario.identidad) {
      const docRefAnt = doc(this.firestore, `usuarios/${identidadAnterior}`);
      deleteDoc(docRefAnt);
    }

    this.usuarios.guardarUsuario(this.usuario)
      .then(() => {
        localStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.estudiante = this.usuario.correo.replace('@unitec.edu', '');
        Swal.fire('Éxito', 'Usuario guardado correctamente', 'success');
        this.modoEdicion = false;
      })
      .catch(err => {
        console.error('Error al guardar usuario', err);
        Swal.fire('Error', 'No se pudo guardar la información', 'error');
      });
  }

  editarUsuario() {
    this.modoEdicion = true;
  }

  private cargarHorasYUltimaActividad() {
    const asistenciasRef = collection(this.firestore, 'asistencias');
    const qAsist = query(asistenciasRef, where('correo', '==', this.usuario.correo));

    collectionData(qAsist, { idField: 'id' }).subscribe((asistencias: any[]) => {
      const acumuladas = asistencias
        .filter(a => a.asistio === true)
        .reduce((sum, a) => sum + (Number(a.horasAcreditadas) || 0), 0);

      this.horasAcumuladas = acumuladas;
      this.horasPendientes = Math.max(0, 70 - this.horasAcumuladas);

      const completadas = asistencias.filter(a => a.asistio === true);
      if (completadas.length > 0) {
        const toDate = (f: any): Date => (f && typeof f.toDate === 'function') ? f.toDate() : new Date(f);
        const ultima = completadas.reduce((a, b) => toDate(a.fechaRegistro) > toDate(b.fechaRegistro) ? a : b);

        this.actividadesService.obtenerActividades().subscribe((acts: Actividad[]) => {
          const act = acts.find(x => x.id === ultima.idActividad);
          this.ultimaActividad = act 
            ? { titulo: act.nombre, fecha: act.fecha } 
            : { titulo: 'Actividad registrada' };
        });
      } else {
        this.ultimaActividad = { titulo: 'Aún no has completado ninguna actividad' };
      }
    });
  }

  private cargarActividadesProximas() {
    const inscripcionesRef = collection(this.firestore, 'inscripciones');
    const qIns = query(inscripcionesRef, where('correo', '==', this.usuario.correo));

    collectionData(qIns, { idField: 'id' }).subscribe((inscripciones: any[]) => {
      this.actividadesService.obtenerActividades().subscribe((acts: Actividad[]) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const idsInscrito = new Set(inscripciones.map(i => i.idActividad));
        this.actividadesProximas = acts.filter(act => {
          const f = new Date(act.fecha);
          f.setHours(0, 0, 0, 0);
          return f >= hoy && idsInscrito.has(act.id!);
        }).map(act => {
          const insc = inscripciones.find(i => i.idActividad === act.id);
          return {
            ...act,
            estadoInscripcion: insc?.estadoInscripcion || 'pendiente'
          } as ActividadEstudiante;
        });
      });
    });
  }

  abrirModalPago(act: Actividad, nombre: string, numeroCuenta: string, correo: string) {
    this.actividadPago = act;
    this.nombreAlumno = nombre;
    this.numeroCuentaAlumno = numeroCuenta;
    this.correoAlumno = correo;
    this.mostrarModalPago = true;
  }

  cerrarModalPago() {
    this.mostrarModalPago = false;
    this.actividadPago = null;
    this.nombreAlumno = '';
    this.numeroCuentaAlumno = '';
    this.correoAlumno = '';
  }

  mailtoLink() {
    if (!this.actividadPago) return '#';
    const subject = `Comprobante de pago - ${this.actividadPago.nombre}`;
    const body = 
      `No elimine la siguiente información:\n\n` +
      `Nombre de la actividad: ${this.actividadPago.nombre}\n` +
      `Nombre del alumno: ${this.nombreAlumno}\n` +
      `Número de cuenta (alumno): ${this.numeroCuentaAlumno}\n\n` +
      `Adjunte su comprobante de pago, por favor.`;

    const correoPago = this.actividadPago.correoPago || 'pagos@ejemplo.com';
    return `mailto:${correoPago}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

 
async cancelarInscripcion(idActividad: string) {
  try {
    // Confirmación antes de cancelar
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres cancelar tu inscripción? Recuerda que los cupos podrían acabarse pronto.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return; // Si el usuario cancela, no hace nada
    }

    const inscripcionesRef = collection(this.firestore, 'inscripciones');
    const q = query(
      inscripcionesRef,
      where('correo', '==', this.usuario.correo),
      where('idActividad', '==', idActividad)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      Swal.fire('Error', 'No se encontró la inscripción para cancelar.', 'error');
      return;
    }

    // Eliminar la inscripción
    for (const inscripcion of querySnapshot.docs) {
      await deleteDoc(doc(this.firestore, 'inscripciones', inscripcion.id));
    }

    // 📌 Leer la actividad actualizada desde Firestore
    const actRef = doc(this.firestore, 'actividades', idActividad);
    const actSnap = await getDoc(actRef);

    if (actSnap.exists()) {
      const actividad = actSnap.data();
      const nuevoCupo = (actividad['cupo'] || 0) + 1;

      // Actualizar el cupo en Firestore
      await updateDoc(actRef, { cupo: nuevoCupo });
    }

    Swal.fire('Cancelada', 'Tu inscripción ha sido cancelada correctamente.', 'success');
    this.cargarActividadesProximas();

  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'No se pudo cancelar la inscripción.', 'error');
  }
}
}


