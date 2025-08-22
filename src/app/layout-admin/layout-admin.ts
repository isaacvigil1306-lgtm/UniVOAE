import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout-admin',
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './layout-admin.html',
  styleUrl: './layout-admin.scss'
})
export class LayoutAdmin {
  menuAbierto: boolean = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarSesion() {
    this.router.navigate(['/']);
  }

}
  
