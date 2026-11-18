CREATE TABLE IF NOT EXISTS learners (
 workspace TEXT NOT NULL, id BIGINT NOT NULL, revision INTEGER NOT NULL DEFAULT 0,
 payload TEXT NOT NULL, PRIMARY KEY(workspace,id)
);
CREATE TABLE IF NOT EXISTS settings (
 workspace TEXT NOT NULL, id TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(workspace,id)
);
CREATE TABLE IF NOT EXISTS audit (
 workspace TEXT NOT NULL, id TEXT PRIMARY KEY, learner_id BIGINT NOT NULL,
 at TEXT NOT NULL, action TEXT NOT NULL, detail TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS audit_workspace_learner ON audit(workspace,learner_id);
