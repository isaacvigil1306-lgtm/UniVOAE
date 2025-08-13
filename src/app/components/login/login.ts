import { Component } from '@angular/core';
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
export class Login {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private Permisos: Permisos, private auth: Auth) {}

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
