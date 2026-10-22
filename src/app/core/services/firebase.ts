
import { Injectable } from '@angular/core';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  readonly app =
    getApps().length > 0
      ? getApp()
      : initializeApp(environment.firebase);

  readonly db = getFirestore(this.app);
}
