import { BaseRepository } from './BaseRepository';
import type {Genre} from '../types';

export class GenreRepository extends BaseRepository<Genre> {
    constructor() {
        super('genres');
    }
}