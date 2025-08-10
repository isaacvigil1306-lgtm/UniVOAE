import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Permisos {
  private apiUrl = 'http://localhost:3000/usuarios'; // tu endpoint de usuarios

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    // Consulta la base de datos (puede ser JSON-server o API real)
    return this.http.get<any[]>(`${this.apiUrl}?username=${username}&password=${password}`);
  }
}
