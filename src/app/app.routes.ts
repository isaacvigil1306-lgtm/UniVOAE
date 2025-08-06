import { Routes } from '@angular/router';
import { Inscripcion } from './components/inscripcion/inscripcion';

export const routes: Routes = [
    {
        path: '',

        loadComponent: () => 
            import('./components/login/login').then((m) => m.Login),

    },
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
            import('./components/inscripcion/inscripcion').then((m) => Inscripcion),

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
        path: 'registro',

        loadComponent: () => 
            import('./components/registro/registro').then((m) => m.Registro),

    },   
    

];
