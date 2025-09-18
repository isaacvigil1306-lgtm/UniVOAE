import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Permisos } from '../../servicios/permisos';
import { Auth } from '@angular/fire/auth';
import { Autenticacion } from '../../servicios/autenticacion';
import { Usuario, UsuariosService } from '../../servicios/usuarios';
import { setDoc, collection, collectionData, doc, deleteDoc, query, where, getDocs, updateDoc, getDoc } from '@angular/fire/firestore';
    import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [FormsModule, CommonModule],
})
export class Login implements OnInit {
  authService = inject(Autenticacion);
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = true;
  isLoggedIn: boolean = false;
  modoRegistro: boolean = false;
  recordarUsuario: boolean = false; // <-- NUEVO

  constructor(
    private router: Router,
    private Permisos: Permisos,
    private auth: Auth,
    private usuariosService: UsuariosService,
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

  cambiarVista() {
  this.modoRegistro = !this.modoRegistro;
}


async olvidarContrasena() {
  if (!this.username) {
    Swal.fire({
      title: 'Correo requerido',
      text: 'Por favor, ingresa tu correo electrónico para enviarte un enlace de recuperación.',
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  try {
    await this.authService.recuperarContrasena(this.username);
    Swal.fire({
      title: 'Correo enviado',
      text: 'Hemos enviado un enlace de recuperación a tu correo.',
      icon: 'success',
      confirmButtonText: 'Cerrar'
    });
  } catch (error: any) {
    Swal.fire({
      title: 'Error',
      text: this.traducirErrorFirebase(error.code),
      icon: 'error',
      confirmButtonText: 'Cerrar'
    });
  }
}


async iniciarSesion() {
  if (!this.username || !this.password) return;

  try {
    // 1️⃣ Iniciar sesión con Firebase Auth
    const credencial = await this.authService.iniciarSesion(
      this.username,
      this.password
    );

    if (!credencial.user || !credencial.user.email) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo obtener el correo del usuario.',
        icon: 'error',
        confirmButtonText: 'Cerrar'
      });
      return;
    }

    const email = credencial.user.email;

    // 2️⃣ Verificar email
    if (!credencial.user.emailVerified) {
      Swal.fire({
        title: 'Correo no verificado',
        text: 'Por favor verifica tu correo antes de iniciar sesión.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    // 3️⃣ Obtener usuario desde Firestore por correo
    this.usuariosService.obtenerUsuarioPorCorreo(email).subscribe((usuarios) => {
      if (!usuarios || usuarios.length === 0) {
        Swal.fire({
          title: 'Usuario no encontrado',
          text: 'Contacta con el administrador.',
          icon: 'error',
          confirmButtonText: 'Cerrar'
        });
        return;
      }

      const user = usuarios[0];

      // 4️⃣ Revisar rol y aprobación
      if (user.rol === 'pendiente' || !user.aprobado) {
        Swal.fire({
          title: 'Cuenta pendiente',
          text: 'Tu cuenta está pendiente de aprobación por el administrador.',
          icon: 'info',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3498db'
        });
        return;
      }

      // 5️⃣ Guardar datos en localStorage
      localStorage.setItem('usuario', JSON.stringify({ correo: user.correo, rol: user.rol }));

      // 6️⃣ Redirigir según rol
      if (user.rol === 'admin') {
        this.router.navigate(['/administrador']);
      } else if (user.rol === 'usuario') {
        this.router.navigate(['/principal']);
      } else {
        Swal.fire({
          title: 'Rol desconocido',
          text: 'Contacta con el administrador.',
          icon: 'error',
          confirmButtonText: 'Cerrar'
        });
      }
    });

  } catch (error: any) {
  console.error(error);
  Swal.fire({
    title: 'Error',
    text: this.traducirErrorFirebase(error.code),
    icon: 'error',
    confirmButtonText: 'Cerrar'
  });
}

  
}

private traducirErrorFirebase(codigo: string): string {
  const mensajes: Record<string, string> = {
    'auth/email-already-in-use': 'Esta cuenta ya se encuentra registrada.',
    'auth/invalid-email': 'El correo ingresado no es válido.',
    'auth/user-not-found': 'No existe una cuenta con este correo.',
    'auth/wrong-password': 'La contraseña es incorrecta.',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intente de nuevo más tarde.',
    'auth/network-request-failed': 'Error de conexión. Revisa tu internet.',
  };
  return mensajes[codigo] || 'Ocurrió un error inesperado. Intenta nuevamente.';
}


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
      const credencial = await this.authService.registrarUsuario(
        this.username,
        this.password
      );

      const usuario: Usuario = {
        correo: this.username,
        rol: 'pendiente',
        aprobado: false,
      };

      await this.usuariosService.guardarUsuario(usuario);
      alert('Usuario registrado correctamente. Por favor verifica tu correo.');
    } catch (error: any) {
  console.error(error);
  Swal.fire({
    title: 'Error',
    text: this.traducirErrorFirebase(error.code),
    icon: 'error',
    confirmButtonText: 'Cerrar'
  });
}

  }

  togglePassword() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';

    // Accesibilidad: actualizar aria-label
    passwordInput.setAttribute(
      'aria-label',
      isHidden ? 'Contraseña visible' : 'Contraseña oculta'
    );
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
