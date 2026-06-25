import {getDatabase} from '../database';
import {type Scalar} from '@op-engineering/op-sqlite';
import {type SRSResult} from '../../utils/srsAlgorithm';

export interface Card {
  id: number;
  language_id: number;
  front: string;
  back: string;
  example_phrase: string | null;
  interval_days: number;
  repetitions: number;
  ease_factor: number;
  last_reviewed_at: string | null;
  next_review_at: string;
  created_at: string;
}

function toRow<T>(row: Record<string, Scalar>): T {
  return row as unknown as T;
}

export const cardRepository = {
  async findByLanguage(languageId: number): Promise<Card[]> {
    const db = getDatabase();
    const result = await db.execute(
      'SELECT * FROM cards WHERE language_id = ? ORDER BY created_at ASC',
      [languageId],
    );
    return result.rows.map(r => toRow<Card>(r));
  },

  async findDueByLanguage(languageId: number): Promise<Card[]> {
    const db = getDatabase();
    const result = await db.execute(
      "SELECT * FROM cards WHERE language_id = ? AND next_review_at <= datetime('now')",
      [languageId],
    );
    return result.rows.map(r => toRow<Card>(r));
  },

  async findById(id: number): Promise<Card | null> {
    const db = getDatabase();
    const result = await db.execute('SELECT * FROM cards WHERE id = ?', [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return toRow<Card>(result.rows[0]);
  },

  async create(data: Omit<Card, 'id' | 'created_at'>): Promise<number> {
    const db = getDatabase();
    const result = await db.execute(
      `INSERT INTO cards
         (language_id, front, back, example_phrase, interval_days, repetitions,
          ease_factor, last_reviewed_at, next_review_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.language_id,
        data.front,
        data.back,
        data.example_phrase,
        data.interval_days,
        data.repetitions,
        data.ease_factor,
        data.last_reviewed_at,
        data.next_review_at,
      ],
    );
    return result.insertId ?? 0;
  },

  async update(id: number, data: Partial<Omit<Card, 'id' | 'language_id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const fields = Object.keys(data) as (keyof typeof data)[];
    if (fields.length === 0) {
      return;
    }
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values: Scalar[] = fields.map(f => {
      const v = data[f];
      return v === undefined ? null : (v as Scalar);
    });
    await db.execute(`UPDATE cards SET ${setClause} WHERE id = ?`, [...values, id]);
  },

  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await db.execute('DELETE FROM cards WHERE id = ?', [id]);
  },

  async bulkCreate(
    languageId: number,
    cards: Pick<Card, 'front' | 'back' | 'example_phrase'>[],
  ): Promise<number> {
    const db = getDatabase();
    let inserted = 0;

    for (const card of cards) {
      const existing = await db.execute(
        'SELECT id FROM cards WHERE language_id = ? AND front = ?',
        [languageId, card.front],
      );
      if (existing.rows.length > 0) {
        continue;
      }
      await db.execute(
        'INSERT INTO cards (language_id, front, back, example_phrase) VALUES (?, ?, ?, ?)',
        [languageId, card.front, card.back, card.example_phrase],
      );
      inserted++;
    }

    return inserted;
  },

  async updateSRS(id: number, srsResult: SRSResult): Promise<void> {
    const db = getDatabase();
    await db.execute(
      `UPDATE cards
       SET interval_days = ?, repetitions = ?, ease_factor = ?,
           last_reviewed_at = datetime('now'), next_review_at = ?
       WHERE id = ?`,
      [srsResult.interval_days, srsResult.repetitions, srsResult.ease_factor, srsResult.next_review_at, id],
    );
  },

  async getTotalDue(): Promise<number> {
    const db = getDatabase();
    const result = await db.execute(
      "SELECT COUNT(*) as count FROM cards WHERE next_review_at <= datetime('now')",
    );
    return (result.rows[0]?.count as number | undefined) ?? 0;
  },

  async getTotalCards(): Promise<number> {
    const db = getDatabase();
    const result = await db.execute('SELECT COUNT(*) as count FROM cards');
    return (result.rows[0]?.count as number | undefined) ?? 0;
  },
};
