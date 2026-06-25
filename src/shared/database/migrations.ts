import {getDatabase} from './database';

export function runMigrations(): void {
  const db = getDatabase();

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS languages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL UNIQUE,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS cards (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      language_id      INTEGER NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
      front            TEXT    NOT NULL,
      back             TEXT    NOT NULL,
      example_phrase   TEXT,
      interval_days    REAL    NOT NULL DEFAULT 0,
      repetitions      INTEGER NOT NULL DEFAULT 0,
      ease_factor      REAL    NOT NULL DEFAULT 2.5,
      last_reviewed_at TEXT,
      next_review_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.executeSync(
    'CREATE INDEX IF NOT EXISTS idx_cards_language_id ON cards(language_id)',
  );

  db.executeSync(
    'CREATE INDEX IF NOT EXISTS idx_cards_next_review ON cards(next_review_at)',
  );

  seedIfEmpty();
}

function seedIfEmpty(): void {
  const db = getDatabase();
  const result = db.executeSync('SELECT COUNT(*) as count FROM languages');
  const count = (result.rows[0]?.count as number | undefined) ?? 0;

  if (count > 0) {
    return;
  }

  db.executeSync("INSERT INTO languages (name) VALUES ('Inglês')");
  const langResult = db.executeSync('SELECT last_insert_rowid() as id');
  const languageId = langResult.rows[0]?.['last_insert_rowid()'] as number | undefined
    ?? langResult.rows[0]?.id as number | undefined;

  if (!languageId) {
    return;
  }

  const seedCards = [
    {front: 'Eu', back: 'I', example: 'I like to work.'},
    {front: 'Você', back: 'You', example: 'You are my friend.'},
    {front: 'Gostar', back: 'To like', example: 'I like to study.'},
    {front: 'Trabalhar', back: 'To work', example: 'I like to work every day.'},
    {front: 'Estudar', back: 'To study', example: 'I like to study English.'},
    {front: 'Comer', back: 'To eat', example: 'I like to eat.'},
    {front: 'Dormir', back: 'To sleep', example: 'I need to sleep.'},
    {front: 'Casa', back: 'House / Home', example: 'I go home.'},
    {front: 'Carro', back: 'Car', example: 'I have a red car.'},
    {front: 'Vermelho', back: 'Red', example: 'I have a red car.'},
  ];

  for (const card of seedCards) {
    db.executeSync(
      `INSERT INTO cards (language_id, front, back, example_phrase, next_review_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [languageId, card.front, card.back, card.example],
    );
  }
}
