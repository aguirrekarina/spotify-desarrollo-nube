import { BaseRepository } from './BaseRepository';
import type { Song } from '../types';

export class SongRepository extends BaseRepository<Song> {
    constructor() {
        super('songs');
    }

    async getByArtist(artistId: string): Promise<Song[]> {
        return this.getByField('artistId', artistId);
    }
}