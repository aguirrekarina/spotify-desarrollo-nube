export interface User {
    uid: string;
    email: string;
    displayName: string;
    role: 'user' | 'admin';
    createdAt: Date;
}

export interface Genre {
    id: string;
    name: string;
    image: string;
    createdAt: Date;
}

export interface Artist {
    id: string;
    name: string;
    image: string;
    genreId: string;
    createdAt: Date;
}

export interface Song {
    id: string;
    name: string;
    audioUrl: string;
    artistId: string;
    duration?: number;
    createdAt: Date;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
}