import { Routes } from '@angular/router';
import { Inscripcion } from './components/inscripcion/inscripcion';
import { Login } from './components/login/login';
import { Calendario } from './components/calendario/calendario';
import { Historial } from './components/historial/historial';
import { Layout } from './layout/layout';
import { Error404 } from './error404/error404';



export const routes: Routes = [
  // RUTA SIN SIDEBAR
 {
    path: '',
    loadComponent: () =>
      import('./components/login/login').then((m) => m.Login),
  },


  // RUTAS CON SIDEBAR (anidadas bajo layout)
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout').then((m) => m.Layout), // TU LAYOUT
    children: [
      {
        path: 'principal',
        loadComponent: () =>
          import('./components/principal/principal').then((m) => m.Principal),
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('./components/calendario/calendario').then((m) => m.Calendario),
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./components/historial/historial').then((m) => m.Historial),
      },
      {
        path: 'inscripcion',
        loadComponent: () =>
          import('./components/inscripcion/inscripcion').then((m) => m.Inscripcion),
      },
     
      
    ],
  },
  {
  path: '',
  loadComponent: () =>
    import('./layout-admin/layout-admin').then((m) => m.LayoutAdmin),
  children: [
     {
    path: 'registro',
    loadComponent: () =>
      import('./components/registro/registro').then((m) => m.Registro),
  },
 {
        path: 'administrador',
        loadComponent: () =>
          import('./components/administrador/administrador').then((m) => m.Administrador),
      },
      {
        path: 'actividades',
        loadComponent: () =>
          import('./components/actividades/actividades').then((m) => m.Actividades),
      },
     {
    path: '**',
    component: Error404,
  },
  ]
}

  
];