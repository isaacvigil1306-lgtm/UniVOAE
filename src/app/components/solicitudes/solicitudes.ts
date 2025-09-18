import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Permisos } from '../../servicios/permisos';
import { Auth } from '@angular/fire/auth';
import { Autenticacion } from '../../servicios/autenticacion';
import { Usuario, UsuariosService } from '../../servicios/usuarios';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitudes',
  imports: [FormsModule, CommonModule, NgFor],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.scss'
})
export class Solicitudes {
usuariosPendientes: Usuario[] = [];
constructor(
  private usuariosService: UsuariosService,
  private router: Router,
  private auth: Auth,
  private permisos: Permisos,
  private autenticacion: Autenticacion
) {}


ngOnInit() {
    this.cargarUsuariosPendientes();
  }

  cargarUsuariosPendientes() {
    this.usuariosService.obtenerUsuariosPendientes().subscribe((usuarios) => {
      this.usuariosPendientes = usuarios;
    });
  }

  aprobar(user: Usuario, rol: 'usuario' | 'admin') {
    user.rol = rol;
    user.aprobado = true;
    this.usuariosService.guardarUsuario(user).then(() => {
      alert(`${user.correo} aprobado como ${rol}`);
      this.cargarUsuariosPendientes();
    });
  }
  asignarATodosEstudiantes() {
  const pendientes = this.usuariosPendientes.filter(u => u.rol === 'pendiente');
  pendientes.forEach(user => {
    user.rol = 'usuario'; // aquí decides que 'usuario' significa estudiante
    user.aprobado = true;
    this.usuariosService.guardarUsuario(user).then(() => {
      console.log(`${user.correo} asignado como estudiante`);
    });
  });
  Swal.fire({
            title: 'Exitoso',
            text: 'Todos las solicitudes fueron enviadas como estudiantes.',
            icon: 'success',
            confirmButtonText: 'Cerrar'
          });
  this.cargarUsuariosPendientes(); // refresca la lista
}
verTodosRoles() {
  this.router.navigate(['/roles']); // ruta hacia el nuevo componente
}

}