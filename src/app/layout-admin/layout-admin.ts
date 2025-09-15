import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-layout-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout-admin.html',
  styleUrls: ['./layout-admin.scss'],
})
export class LayoutAdmin {
  menuAbierto = false;
  usuarioCorreo: string = 'Administrador';

  constructor(private router: Router) {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const userObj = JSON.parse(usuario);
      const correo = userObj.correo || '';

      this.usuarioCorreo = correo.endsWith('@unitec.edu')
        ? correo.replace('@unitec.edu', '')
        : correo;
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

cerrarSesion() {
  Swal.fire({
    title: '¿Cerrar sesión?',
    text: 'Se cerrará tu sesión y se borrarán todos los datos temporales.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        // 🔹 Cerrar sesión de Firebase si la estás usando
        // await this.authService.cerrarSesion(); // Descomenta si tienes acceso a tu servicio Auth aquí

        // 🔥 Borrar TODAS las variables de sesión
        localStorage.clear();
        sessionStorage.clear();

        // Mostrar mensaje de confirmación
        Swal.fire({
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        // 🔹 Redirigir al login y recargar la app para limpiar estado
        this.router.navigate(['/']).then(() => {
          window.location.reload();
        });
      } catch (error: any) {
        Swal.fire({
          title: 'Error al cerrar sesión',
          text: error.message || 'No se pudo cerrar sesión correctamente.',
          icon: 'error',
          confirmButtonText: 'Cerrar'
        });
      }
    }
  });
}


}
