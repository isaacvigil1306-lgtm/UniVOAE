import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }
}
