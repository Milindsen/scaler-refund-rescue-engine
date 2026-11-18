// The adapter deliberately supports only the application's parameterized queries.
// Every record is scoped to the server-selected workspace, including audit entries.
export function compile(statement,workspace,previousChanges=0){
 const args=[...statement.args];let sql=statement.sql;
 if(sql.startsWith('INSERT INTO audit')){
  if(previousChanges!==1)return null;
  sql='INSERT INTO audit (id,learner_id,at,action,detail,workspace) VALUES (?,?,?,?,?,?)';args.push(workspace);
 }else if(sql.startsWith('INSERT OR IGNORE INTO learners')){
  sql='INSERT INTO learners (id,revision,payload,workspace) VALUES (?,?,?,?) ON CONFLICT (workspace,id) DO NOTHING';args.push(workspace);
 }else if(sql.startsWith('INSERT OR IGNORE INTO settings')){
  sql='INSERT INTO settings (id,payload,workspace) VALUES (?,?,?) ON CONFLICT (workspace,id) DO NOTHING';args.push(workspace);
 }else if(sql.startsWith('INSERT OR REPLACE INTO settings')){
  sql='INSERT INTO settings (id,payload,workspace) VALUES (?,?,?) ON CONFLICT (workspace,id) DO UPDATE SET payload=EXCLUDED.payload';args.push(workspace);
 }else if(sql.startsWith('SELECT ')||sql.startsWith('UPDATE learners ')){
  const order=sql.includes(' ORDER BY ')?sql.slice(sql.indexOf(' ORDER BY ')):'';
  sql=sql.replace(order,'');sql+=(sql.includes(' WHERE ')?' AND ':' WHERE ')+'workspace=?'+order;args.push(workspace);
 }else throw Error('Unsupported database statement');
 let i=0;return {text:sql.replace(/\?/g,()=>'$'+(++i)),values:args};
}
export function database(client,workspace){
 const execute=async(q,previous)=>{const compiled=compile(q,workspace,previous);if(!compiled)return {results:[],meta:{changes:0}};const r=await client.query(compiled);return {results:r.rows,meta:{changes:r.rowCount}}};
 return {prepare(sql){return {sql,args:[],bind(...args){this.args=args;return this},run(){return execute(this,0)},all(){return execute(this,0)},async first(){return (await execute(this,0)).results[0]||null}}},async batch(statements){
 if(statements.length>1&&statements.every(q=>q.sql.startsWith('INSERT OR IGNORE INTO learners'))){let n=0;const values=statements.flatMap(q=>[...q.args,workspace]);const tuples=statements.map(()=> '('+Array.from({length:4},()=>'$'+(++n)).join(',')+')');await client.query('INSERT INTO learners (id,revision,payload,workspace) VALUES '+tuples.join(',')+' ON CONFLICT (workspace,id) DO NOTHING',values);return statements.map(()=>({results:[],meta:{changes:1}}));}
 await client.query('BEGIN');try{const results=[];for(const q of statements)results.push(await execute(q,results.at(-1)?.meta.changes||0));await client.query('COMMIT');return results}catch(e){await client.query('ROLLBACK');throw e}}};
}
