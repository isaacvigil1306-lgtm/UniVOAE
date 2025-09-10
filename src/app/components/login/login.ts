
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Permisos } from '../../servicios/permisos';
import { Auth } from '@angular/fire/auth';
import { Autenticacion } from '../../servicios/autenticacion';
import { Usuario, UsuariosService } from '../../servicios/usuarios';
import {  setDoc,  collection, collectionData, doc, deleteDoc, query, where, getDocs,updateDoc, getDoc } from '@angular/fire/firestore';


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
    private auth: Auth,
    private usuariosService: UsuariosService ,
    
    
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



  // Login con Firebase usando solo correo
async iniciarSesion() {
  if (!this.username || !this.password) return;

  try {
    const credencial = await this.authService.iniciarSesion(
      this.username,
      this.password
    );

    if (!credencial.user?.emailVerified) {
      alert('Por favor verifica tu correo antes de iniciar sesión');
      return;
    }

    // 1️⃣ Obtener usuario desde Firestore
    this.usuariosService.obtenerUsuarioPorCorreo(this.username).subscribe((usuarios) => {
      if (usuarios.length === 0) {
        this.errorMessage = 'Usuario no registrado correctamente';
        return;
      }

      const user = usuarios[0];

      if (user.rol === 'pendiente' || !user.aprobado) {
        alert('Tu cuenta está pendiente de aprobación por el administrador.');
        return;
      }

      // 1️⃣ Guardar correo en localStorage después de iniciar sesión correctamente
localStorage.setItem('usuario', JSON.stringify({ correo: this.username }));


      // 2️⃣ Redirigir según rol
      if (user.rol === 'admin') {
        this.router.navigate(['/administrador']);
      } else if (user.rol === 'usuario'){this.router.navigate(['/principal']);
      }
    });
  } catch (error: any) {
    console.error(error);
    this.errorMessage = error.message;
  }
}


  // Registro con Firebase usando solo correo
 async register() {
  if (!this.username || !this.password) {
    alert('Por favor, ingresa correo y contraseña');
    return;
  }

  if (!this.username.endsWith('@unitec.edu')) {
    this.errorMessage = 'Solo se permiten correos @unitec.edu';
    return;
  }

  try {
    // 1️⃣ Registrar en Firebase Auth
    const credencial = await this.authService.registrarUsuario(
      this.username,
      this.password
    );

    // 2️⃣ Crear documento en usuarios con rol pendiente
    const usuario: Usuario = {
      correo: this.username,
      rol: 'pendiente',
      aprobado: false
    };

    await this.usuariosService.guardarUsuario(usuario);

    alert('Usuario registrado correctamente. Por favor verifica tu correo.');
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
