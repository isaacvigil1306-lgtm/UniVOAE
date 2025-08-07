import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
  estudiante = 'David Salvador'; 


  constructor(private router: Router) {}

cerrarSesion() {
  
  this.router.navigate(['/']);
}
  
}


