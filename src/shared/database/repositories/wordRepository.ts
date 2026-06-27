import {getDatabase} from '../database';
import {type Scalar} from '@op-engineering/op-sqlite';

export interface Word {
  id: number;
  word_list_id: number;
  word: string;
  translation: string;
  created_at: string;
}

function toRow<T>(row: Record<string, Scalar>): T {
  return row as unknown as T;
}

export const wordRepository = {
  async findByList(listId: number): Promise<Word[]> {
    const db = getDatabase();
    const result = await db.execute(
      'SELECT * FROM words WHERE word_list_id = ? ORDER BY created_at ASC',
      [listId],
    );
    return result.rows.map(r => toRow<Word>(r));
  },

  async create(listId: number, word: string, translation: string): Promise<number> {
    const db = getDatabase();
    const result = await db.execute(
      'INSERT INTO words (word_list_id, word, translation) VALUES (?, ?, ?)',
      [listId, word, translation],
    );
    return result.insertId ?? 0;
  },

  async update(id: number, word: string, translation: string): Promise<void> {
    const db = getDatabase();
    await db.execute(
      'UPDATE words SET word = ?, translation = ? WHERE id = ?',
      [word, translation, id],
    );
  },

  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await db.execute('DELETE FROM words WHERE id = ?', [id]);
  },

  async bulkCreate(
    listId: number,
    entries: {word: string; translation: string}[],
  ): Promise<number> {
    const db = getDatabase();
    let inserted = 0;

    for (const entry of entries) {
      const w = entry.word.trim();
      const t = entry.translation.trim();
      if (!w || !t) {
        continue;
      }
      await db.execute(
        'INSERT INTO words (word_list_id, word, translation) VALUES (?, ?, ?)',
        [listId, w, t],
      );
      inserted++;
    }

    return inserted;
  },

  async getTotalByLanguage(languageId: number): Promise<number> {
    const db = getDatabase();
    const result = await db.execute(
      `SELECT COUNT(w.id) as count
       FROM words w
       JOIN word_lists wl ON wl.id = w.word_list_id
       WHERE wl.language_id = ?`,
      [languageId],
    );
    return (result.rows[0]?.count as number | undefined) ?? 0;
  },
};
