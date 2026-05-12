export const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price TEXT,
  images TEXT NOT NULL,
  specs TEXT,
  source_url TEXT NOT NULL,
  raw_html TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS copywriters (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  hashtags TEXT NOT NULL,
  tips TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scripts (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  hook TEXT NOT NULL,
  scenes TEXT NOT NULL,
  cta TEXT NOT NULL,
  duration TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`
