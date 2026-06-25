import {getDatabase} from '../database';
import {type Scalar} from '@op-engineering/op-sqlite';

export interface Language {
  id: number;
  name: string;
  created_at: string;
}

export interface LanguageWithStats extends Language {
  total_cards: number;
  due_today: number;
}

function toRow<T>(row: Record<string, Scalar>): T {
  return row as unknown as T;
}

export const languageRepository = {
  async findAll(): Promise<LanguageWithStats[]> {
    const db = getDatabase();
    const result = await db.execute(`
      SELECT
        l.id,
        l.name,
        l.created_at,
        COUNT(c.id) as total_cards,
        SUM(CASE WHEN c.next_review_at <= datetime('now') THEN 1 ELSE 0 END) as due_today
      FROM languages l
      LEFT JOIN cards c ON c.language_id = l.id
      GROUP BY l.id
      ORDER BY l.name ASC
    `);
    return result.rows.map(row => {
      const r = toRow<LanguageWithStats>(row);
      return {
        ...r,
        total_cards: (r.total_cards as unknown as number) ?? 0,
        due_today: (r.due_today as unknown as number) ?? 0,
      };
    });
  },

  async findById(id: number): Promise<Language | null> {
    const db = getDatabase();
    const result = await db.execute('SELECT * FROM languages WHERE id = ?', [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return toRow<Language>(result.rows[0]);
  },

  async create(name: string): Promise<number> {
    const db = getDatabase();
    const result = await db.execute('INSERT INTO languages (name) VALUES (?)', [name]);
    return result.insertId ?? 0;
  },

  async update(id: number, name: string): Promise<void> {
    const db = getDatabase();
    await db.execute('UPDATE languages SET name = ? WHERE id = ?', [name, id]);
  },

  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await db.execute('DELETE FROM languages WHERE id = ?', [id]);
  },
};
