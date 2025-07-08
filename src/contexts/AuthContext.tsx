import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User, AuthContextType } from '../types';
import { UserRepository } from '../repositories/UserRepository';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const userRepository = new UserRepository();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userData = await userRepository.getById(firebaseUser.uid);
                    if (userData) {
                        setUser(userData);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (email: string, password: string, displayName: string) => {
        const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

        const userData: Omit<User, 'id'> = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName,
            role: 'user',
            createdAt: new Date()
        };

        await userRepository.createUser(firebaseUser.uid, userData);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
