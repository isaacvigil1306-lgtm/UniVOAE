import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UsuariosService, Usuario } from '../../servicios/usuarios';
import { FormsModule } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';

@Component({
  selector: 'app-roles',
  imports: [FormsModule, CommonModule, NgFor],
  templateUrl: './roles.html',
  styleUrl: './roles.scss'
})
export class Roles implements OnInit {

  estudiantes: Usuario[] = [];
  administradores: Usuario[] = [];

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    // Traer todos los usuarios, sin filtrar por pendientes
    this.usuariosService.obtenerTodosUsuarios().subscribe(usuarios => {
      this.estudiantes = usuarios.filter(u => u.rol === 'usuario');
      this.administradores = usuarios.filter(u => u.rol === 'admin');
    });
  }

  

  cambiarRol(user: Usuario, nuevoRol: 'usuario' | 'admin') {
    user.rol = nuevoRol;
    this.usuariosService.guardarUsuario(user).then(() => {
      alert(`${user.correo} ahora es ${nuevoRol}`);
      this.cargarUsuarios(); // refresca tablas
    });
  }
  
}

