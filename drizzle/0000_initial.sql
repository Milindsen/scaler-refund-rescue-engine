CREATE TABLE learners (id INTEGER PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 0, payload TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE settings (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE audit (id TEXT PRIMARY KEY, learner_id INTEGER NOT NULL, at TEXT NOT NULL, action TEXT NOT NULL, detail TEXT NOT NULL);
