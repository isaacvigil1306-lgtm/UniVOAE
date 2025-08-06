import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router) {}

  login() {
    if (this.username === 'user' && this.password === 'user') {
      this.router.navigate(['/principal']);
    } else if (this.username === 'admin' && this.password === 'admin') {
      this.router.navigate(['/administrador']);
    } else {
      this.errorMessage = 'Usuario o contraseña incorrectos.';
    }
  }
}
