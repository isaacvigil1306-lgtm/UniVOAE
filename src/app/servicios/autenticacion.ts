import { inject, Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from '@angular/fire/auth';
import { addDoc, setDoc, Firestore, collection, docData,doc } from '@angular/fire/firestore';
import { signOut } from 'firebase/auth';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Autenticacion {

  auth = inject(Auth);
  authState = authState(this.auth);
  currentUser : any = null;
  loggeado = false;
  firestore = inject (Firestore);

  constructor() {
this.authState.subscribe(async (user) => {
console.log('Usuario actual:', user);
if (user){
  this.loggeado = true;
  this.currentUser = await this.getUser(user.uid);
}else{
  this.loggeado = false;
}
});

}

addUser(user: any, id: string) {
const userDocRef = doc(this.firestore, `users/${id}`);
return setDoc(userDocRef, user);
}


getUser(uuid: string) {
const userCollection = collection(this.firestore, 'users');
const document = doc(userCollection, uuid);
return lastValueFrom(docData(document)) ;

}

  registrarUsuario(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password).then(
      async (credencial) => {

        if (credencial.user && !credencial.user.emailVerified) {
          alert('Por favor verifica tu correo');
          await sendEmailVerification(credencial.user);
        }
        this.addUser(
          {email: credencial.user.email,},credencial.user.uid);
        return credencial;
      }
    );
  } 

  cerrarSesion(){
    return signOut(this.auth)
  }

  iniciarSesion(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password).then(
      async (credencial) => {
        if (credencial.user && !credencial.user.emailVerified) {
          alert('Por favor verifica tu correo');
          await sendEmailVerification(credencial.user);
        }
          return credencial;
        }
);
  }
}
