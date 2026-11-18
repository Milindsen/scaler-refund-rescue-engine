import pg from 'pg';
import {randomBytes,timingSafeEqual,createHash} from 'node:crypto';
import worker from '../src/worker.mjs';
import {database} from '../server/postgres.mjs';
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL||process.env.POSTGRES_URL,max:3,connectionTimeoutMillis:10000,idleTimeoutMillis:10000});
const equal=(a,b)=>timingSafeEqual(createHash('sha256').update(a).digest(),createHash('sha256').update(b).digest());
export default async function handler(req,res){
 const mode=process.env.APP_MODE==='pilot'?'pilot':'demo';
 if(mode==='pilot'){
  const key=process.env.PILOT_ACCESS_KEY;
  if(!key||key.length<20){res.status(503).send('Pilot is locked. Configure a PILOT_ACCESS_KEY of at least 20 characters.');return;}
  const supplied=Buffer.from((req.headers.authorization||'').replace(/^Basic /,''),'base64').toString().split(':').slice(1).join(':');
  if(!equal(supplied,key)){res.setHeader('WWW-Authenticate','Basic realm="Rescue pilot", charset="UTF-8"');res.status(401).send('This pilot is private. Ask your workspace owner for access.');return;}
 }
 let session=(req.headers.cookie||'').match(/(?:^|;\s*)rescue_session=([a-f0-9]{64})(?:;|$)/)?.[1];
 if(!session){session=randomBytes(32).toString('hex');res.setHeader('Set-Cookie','rescue_session='+session+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800');}
 const path=new URL(req.url,'https://'+req.headers.host).pathname;
 if(!process.env.DATABASE_URL&&!process.env.POSTGRES_URL){res.status(503).send('Database setup is required. Connect a PostgreSQL database in Vercel Storage and redeploy.');return;}
 let client;
 try{
  client=await pool.connect();
  const origin='https://'+req.headers.host;
  const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(typeof v==='string')headers.set(k,v);
  const request=new Request(origin+(path==='/api/index'?'/':path),{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:typeof req.body==='string'?req.body:JSON.stringify(req.body||{})}:{})});
  const response=await worker.fetch(request,{DB:database(client,mode==='pilot'?'pilot':'demo:'+session),APP_MODE:mode});
  response.headers.forEach((v,k)=>res.setHeader(k,v));res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
 }catch{res.status(503).json({error:'Database temporarily unavailable. Please retry. If this continues, check the deployment configuration.'});}
 finally{client?.release();}
}
