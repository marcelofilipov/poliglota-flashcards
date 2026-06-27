import {getDatabase} from '../database';
import {type Scalar} from '@op-engineering/op-sqlite';

export interface WordList {
  id: number;
  language_id: number;
  name: string;
  created_at: string;
  word_count?: number;
}

function toRow<T>(row: Record<string, Scalar>): T {
  return row as unknown as T;
}

export const wordListRepository = {
  async findByLanguage(languageId: number): Promise<WordList[]> {
    const db = getDatabase();
    const result = await db.execute(
      `SELECT wl.*, COUNT(w.id) as word_count
       FROM word_lists wl
       LEFT JOIN words w ON w.word_list_id = wl.id
       WHERE wl.language_id = ?
       GROUP BY wl.id
       ORDER BY wl.created_at ASC`,
      [languageId],
    );
    return result.rows.map(r => {
      const row = toRow<WordList>(r);
      return {
        ...row,
        word_count: (row.word_count as unknown as number) ?? 0,
      };
    });
  },

  async create(languageId: number, name: string): Promise<number> {
    const db = getDatabase();
    const result = await db.execute(
      'INSERT INTO word_lists (language_id, name) VALUES (?, ?)',
      [languageId, name],
    );
    return result.insertId ?? 0;
  },

  async update(id: number, name: string): Promise<void> {
    const db = getDatabase();
    await db.execute('UPDATE word_lists SET name = ? WHERE id = ?', [name, id]);
  },

  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await db.execute('DELETE FROM word_lists WHERE id = ?', [id]);
  },
};
