import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
const probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
const password=randomBytes(16).toString('hex'),secret=randomBytes(32).toString('hex');
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env:{...process.env,NODE_ENV:'production',APP_PASSWORD:password,SESSION_SECRET:secret,DATABASE_URL:'postgresql://invalid:invalid@127.0.0.1:1/ninho'},stdio:'ignore'});
let exited=false;child.on('exit',()=>{exited=true});const base='http://127.0.0.1:'+port;
try{
 let ready=false;for(let i=0;i<80;i++){if(exited)throw Error('Servidor encerrou antes dos testes.');try{if((await fetch(base+'/login')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,150))}assert.ok(ready,'Servidor não iniciou');
 assert.equal((await fetch(base+'/api/items')).status,401);
 assert.equal((await fetch(base+'/api/items',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
 assert.equal((await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'errada'})})).status,401);
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie');assert.match(cookie,/HttpOnly/i);assert.match(cookie,/Secure/i);const session=cookie.split(';')[0];
 assert.equal((await fetch(base+'/api/items',{method:'POST',headers:{cookie:session,'Content-Type':'application/json'},body:'{}'})).status,400);
 assert.equal((await fetch(base+'/api/items',{method:'DELETE',headers:{cookie:session,'Content-Type':'application/json',origin:'https://outro.example'},body:JSON.stringify({id:'test'})})).status,403);
 assert.equal((await fetch(base+'/api/health')).status,503);
 const logout=await fetch(base+'/api/auth/logout',{method:'POST',headers:{cookie:session}});assert.equal(logout.status,200);assert.match(logout.headers.get('set-cookie'),/expires=Thu, 01 Jan 1970/i);
 console.log('Smoke HTTP: login, cookies, APIs protegidas, validação, origem, healthcheck e saída aprovados.');
}finally{child.kill('SIGTERM')}
