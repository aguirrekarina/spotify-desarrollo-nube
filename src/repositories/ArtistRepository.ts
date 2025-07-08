import { BaseRepository } from './BaseRepository';
import type { Artist } from '../types';

export class ArtistRepository extends BaseRepository<Artist> {
    constructor() {
        super('artists');
    }

    async getByGenre(genreId: string): Promise<Artist[]> {
        return this.getByField('genreId', genreId);
    }
}