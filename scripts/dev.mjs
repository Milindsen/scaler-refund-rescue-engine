import http from 'node:http';
import {webcrypto} from 'node:crypto';
import worker from '../src/worker.mjs';
import {database} from './local-db.mjs';
globalThis.crypto??=webcrypto;const DB=database();
http.createServer(async(req,res)=>{try{const chunks=[];for await(const c of req)chunks.push(c);const request=new Request('http://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});const out=await worker.fetch(request,{DB});res.writeHead(out.status,Object.fromEntries(out.headers));res.end(Buffer.from(await out.arrayBuffer()))}catch(e){res.writeHead(500);res.end('Local preview error: '+e.message)}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://localhost:4173'));
