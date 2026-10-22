
import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

import { FirebaseService } from './firebase';

export interface LoadingGroup {
  containerNumber: string;
  photoUrl: string;
}

export interface LoadingOperation {
  id?: string;
  clientName: string;
  workOrder: string;
  groups: LoadingGroup[];
  createdAt?: unknown;
}

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly db;

  constructor(firebase: FirebaseService) {
    this.db = firebase.db;
  }

  async getOperations(): Promise<LoadingOperation[]> {
    const ref = collection(this.db, 'loadingOperations');
    const q = query(ref, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as LoadingOperation[];
  }

  async getOperation(id: string): Promise<LoadingOperation | null> {
    const snapshot = await getDoc(doc(this.db, 'loadingOperations', id));

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as LoadingOperation;
  }

  async addOperation(
    operation: Omit<LoadingOperation, 'id' | 'createdAt'>
  ): Promise<string> {
    const ref = collection(this.db, 'loadingOperations');

    const result = await addDoc(ref, {
      ...operation,
      createdAt: serverTimestamp(),
    });

    return result.id;
  }

  async deleteOperation(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'loadingOperations', id));
  }
}
