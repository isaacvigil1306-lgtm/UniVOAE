import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Permisos } from '../../servicios/permisos';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [FormsModule, CommonModule],
})
export class Login implements OnInit{
  username: string = '';
  password: string = '';
  errorMessage: string = '';
   isLoading = true; // inicia en true

  constructor(private router: Router, private Permisos: Permisos, private auth: Auth) {}
  ngOnInit() {
    // Crear un objeto Image para esperar a que se cargue el fondo
    const img = new Image();
    img.src = 'https://portal.unitec.edu/Documentos/2025/CEUTEC/FondoZoom_CEUTEC_3.png';

    img.onload = () => {
      this.isLoading = false; // cuando la imagen cargue, ocultar preloader
    };

    img.onerror = () => {
      console.error('Error cargando la imagen');
      this.isLoading = false; // ocultar aunque falle
    };
  }
login() {
  this.Permisos.login(this.username, this.password).subscribe({
    next: (usuarios) => {
      if (usuarios.length > 0) {
        const user = usuarios[0];

        // Guardar usuario en localStorage para sesión
        localStorage.setItem('usuario', JSON.stringify(user));

        if (user.rol === 'admin') {
          this.router.navigate(['/administrador']);
        } else {
          this.router.navigate(['/principal']);
        }
      } else {
        this.errorMessage = 'Usuario o contraseña incorrectos.';
      }
    },
    error: () => {
      this.errorMessage = 'Error al conectar con el servidor.';
    }
  });
}




  togglePassword() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  }
}
