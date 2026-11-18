import {readFileSync,writeFileSync,mkdirSync,cpSync} from 'node:fs';
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
const domain=readFileSync('src/domain.mjs','utf8').replaceAll('export ','');
const view=readFileSync('src/view.mjs','utf8').replace('export const html','const html');
const worker=readFileSync('src/worker.mjs','utf8').replace(/^import .*;\r?\n/gm,'');
writeFileSync('dist/server/index.js',domain+'\n'+view+'\n'+worker);cpSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built self-contained Worker');
