import { BaseRepository } from './BaseRepository';
import type { User } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super('users');
    }

    async createUser(uid: string, userData: Omit<User, 'id'>): Promise<void> {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            ...userData,
            createdAt: new Date()
        });
    }
}