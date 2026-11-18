import {database} from './local-db.mjs';
const db=database();await db.batch(['DELETE FROM learners','DELETE FROM audit','DELETE FROM settings'].map(q=>db.prepare(q)));console.log('Local synthetic workspace reset. Reload to reseed.');
