import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp({ apiKey: "AIzaSyAj3nVaaSyhs41rRtQJEPwdd7WyCrUXSME",
  authDomain: "univoae.firebaseapp.com",
  projectId: "univoae",
  storageBucket: "univoae.firebasestorage.app",
  messagingSenderId: "774994213861",
  appId: "1:774994213861:web:f6d1ed53aa56d195e30d0c",
  measurementId: "G-JJ7T2K5V6G" })),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
