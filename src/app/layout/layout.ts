import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class Layout {
  estudiante = 'Usuario'; 
  sidebarAbierto = false;
  menuAbierto = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      if (usuario.correo) {
        // Mostrar solo la parte antes de @unitec.edu
        this.estudiante = usuario.correo.replace('@unitec.edu', '');
      } else {
        this.estudiante = 'Usuario';
      }
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario'); // limpiar correo
    this.router.navigate(['/']);
  }

  toggleSidebar() {
    this.sidebarAbierto = !this.sidebarAbierto;
  }
}
