import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export abstract class BaseRepository<T> {
    protected collectionName: string;

    constructor(collectionName: string) {
        this.collectionName = collectionName;
    }

    async getAll(): Promise<T[]> {
        const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    }

    async getById(id: string): Promise<T | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
    }

    async create(data: Omit<T, 'id' | 'createdAt'>): Promise<string> {
        const docRef = await addDoc(collection(db, this.collectionName), {
            ...data,
            createdAt: new Date()
        });
        return docRef.id;
    }

    async update(id: string, data: Partial<T>): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await updateDoc(docRef, data);
    }

    async delete(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
    }

    async getByField(field: string, value: unknown): Promise<T[]> {
        const q = query(
            collection(db, this.collectionName),
            where(field, '==', value),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    }
}