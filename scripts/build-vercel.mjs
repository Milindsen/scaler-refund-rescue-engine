import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import pg from 'pg';
mkdirSync('public',{recursive:true});writeFileSync('public/robots.txt','User-agent: *\nDisallow: /\n');
if(process.env.DATABASE_URL||process.env.POSTGRES_URL){const client=new pg.Client({connectionString:process.env.DATABASE_URL||process.env.POSTGRES_URL});await client.connect();try{await client.query(readFileSync('server/schema.sql','utf8'));console.log('PostgreSQL schema ready')}finally{await client.end()}}
else console.log('No database connected yet. Connect PostgreSQL in Vercel Storage and redeploy.');
