import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscripcion',
  standalone: true,
  templateUrl: './inscripcion.html',
  styleUrls: ['./inscripcion.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class Inscripcion {
  nombre: string = '';
  identidad: string = '';
  correo: string = '';
  telefono: string = '';
  comprobante: File | null = null;

  enviado: boolean = false;

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.comprobante = file;
  }

  enviarInscripcion() {
    if (!this.nombre || !this.identidad || !this.correo) {
      alert('Por favor, complete los campos requeridos.');
      return;
    }


    this.enviado = true;

    // Resetear formulario
    this.nombre = '';
    this.identidad = '';
    this.correo = '';
    this.telefono = '';
    this.comprobante = null;
  }
 constructor(private router: Router) {}

cerrarSesion() {
  
  this.router.navigate(['/']);
}
  
}


