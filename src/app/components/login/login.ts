import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Permisos } from '../../servicios/permisos';
import { Auth } from '@angular/fire/auth';
import { Autenticacion } from '../../servicios/autenticacion';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [FormsModule, CommonModule],
})
export class Login implements OnInit {
  authService = inject(Autenticacion);
  username: string = ''; // correo
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = true;
  isLoggedIn: boolean = false;

  constructor(
    private router: Router,
    private Permisos: Permisos,
    private auth: Auth
  ) {}

  ngOnInit() {
    const img = new Image();
    img.src = 'https://portal.unitec.edu/Documentos/2025/CEUTEC/FondoZoom_CEUTEC_3.png';
    img.onload = () => (this.isLoading = false);
    img.onerror = () => {
      console.error('Error cargando la imagen');
      this.isLoading = false;
    };
  }

  // Login contra backend usando solo correo
  login() {
    if (!this.username || !this.password) {
      alert('Por favor, ingresa un correo y una contraseña');
      return;
    }

    if (!this.username.endsWith('@unitec.edu')) {
      this.errorMessage = 'Solo se permiten correos con dominio @unitec.edu';
      return;
    }

    this.Permisos.login(this.username, this.password).subscribe({
      next: (usuarios) => {
        if (usuarios.length > 0) {
          const user = usuarios[0];
          // Guardar correo en localStorage
          localStorage.setItem('usuario', JSON.stringify({ correo: this.username }));
          this.isLoggedIn = true;

          if (this.username.toLowerCase() === 'odaly.sierra17@unitec.edu') {
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
      },
    });
  }

  // Login con Firebase usando solo correo
  async iniciarSesion() {
    if (!this.username || !this.password) {
      alert('Por favor, ingresa un correo y una contraseña');
      return;
    }

    if (!this.username.endsWith('@unitec.edu')) {
      this.errorMessage = 'Solo se permiten correos con dominio @unitec.edu';
      return;
    }

    try {
      const credencial = await this.authService.iniciarSesion(
        this.username,
        this.password
      );

      // Guardar correo en localStorage
      localStorage.setItem('usuario', JSON.stringify({ correo: this.username }));

      if (credencial.user?.emailVerified) {
        this.isLoggedIn = true;
        if (this.username.toLowerCase() === 'odaly.sierra17@unitec.edu') {
          this.router.navigate(['/administrador']);
        } else {
          this.router.navigate(['/principal']);
        }
      } else {
        alert('Por favor verifica tu correo antes de iniciar sesión');
      }
    } catch (error: any) {
      console.error(error);
      this.errorMessage = error.message;
    }
  }

  // Registro con Firebase usando solo correo
  async register() {
    if (!this.username || !this.password) {
      alert('Por favor, ingresa un correo y una contraseña');
      return;
    }

    if (!this.username.endsWith('@unitec.edu')) {
      this.errorMessage = 'Solo se permiten correos con dominio @unitec.edu';
      return;
    }

    try {
      const credencial = await this.authService.registrarUsuario(
        this.username,
        this.password
      );

      // Guardar correo en localStorage
      localStorage.setItem('usuario', JSON.stringify({ correo: this.username }));

      alert('Usuario registrado: ' + credencial.user?.email);
      if (!credencial.user?.emailVerified) {
        alert('Por favor verifica tu correo antes de iniciar sesión');
      }
    } catch (error: any) {
      console.error(error);
      this.errorMessage = error.message;
    }
  }

  togglePassword() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  }

  logout() {
    this.authService
      .cerrarSesion()
      .then(() => {
        this.isLoggedIn = false;
        this.username = '';
        this.password = '';
        localStorage.removeItem('usuario');
        alert('Sesión cerrada correctamente');
      })
      .catch((error) => {
        alert('Error al cerrar sesión: ' + error.message);
      });
  }
}
