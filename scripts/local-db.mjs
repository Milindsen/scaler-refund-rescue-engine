import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync} from 'node:fs';
export function database(file='.local/demo.sqlite'){
 mkdirSync('.local',{recursive:true});
 function run(queries){const r=spawnSync('python',['scripts/sqlite.py',file],{input:JSON.stringify(queries),encoding:'utf8',maxBuffer:12*1024*1024});if(r.status!==0)throw Error(r.stdout||r.stderr);return JSON.parse(r.stdout)}
 const db={prepare(sql){const q={sql,args:[],bind(...args){this.args=args;return this},async run(){return run([this])[0]},async all(){return run([this])[0]},async first(){return run([this])[0].results[0]||null}};return q},async batch(q){return run(q)}};
 const statements=readFileSync('drizzle/0000_initial.sql','utf8').split('--> statement-breakpoint').map(s=>s.trim().replace('CREATE TABLE','CREATE TABLE IF NOT EXISTS'));
 run(statements.map(sql=>({sql})));return db;
}
