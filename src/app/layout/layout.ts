import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
  estudiante = 'Usuario'; 
  sidebarAbierto = false;

  constructor(private router: Router) {}

  ngOnInit() {
  const usuarioString = localStorage.getItem('usuario');
  if (usuarioString) {
    const usuario = JSON.parse(usuarioString);
    if (usuario.nombre) {
      const partes = usuario.nombre.trim().split(' ');
      // partes[0] = primer nombre
      // partes[partes.length - 2] = primer apellido (antes del último)
      // Solo tomar primer nombre y primer apellido
      if (partes.length >= 2) {
        this.estudiante = partes[0] + ' ' + partes[partes.length - 2];
      } else {
        this.estudiante = usuario.nombre; // si solo hay un nombre, mostrar completo
      }
    } else {
      this.estudiante = 'Usuario';
    }
  }
}

  menuAbierto = false;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }


  
  cerrarSesion() {
    this.router.navigate(['/']);
  }

  toggleSidebar() {
    this.sidebarAbierto = !this.sidebarAbierto;
    
  }
}