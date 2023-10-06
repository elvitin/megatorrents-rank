import { DB } from 'https://deno.land/x/sqlite@v3.8/mod.ts';
const db = new DB('movies.db');
db.execute(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    oficial_title TEXT,
    imdbScore REAL,
    audio_quality REAL,
    video_quality REAL,
    page_url TEXT NOT NULL,
    updated BOOLEAN NOT NULL CHECK (updated IN (FALSE, TRUE)) DEFAULT FALSE,
    UNIQUE(page_url)
  );
`);

db.close();
