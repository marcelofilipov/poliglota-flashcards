import {open, type DB} from '@op-engineering/op-sqlite';

let db: DB | null = null;

export function getDatabase(): DB {
  if (!db) {
    db = open({name: 'policard.db'});
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
