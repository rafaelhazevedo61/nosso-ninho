import test from 'node:test';
import assert from 'node:assert/strict';
import {issueSession,validSession,correctPassword,canAttempt,sameOrigin} from '../lib/auth.mjs';
process.env.APP_PASSWORD='senha-exclusiva-de-teste';process.env.SESSION_SECRET='segredo-de-teste-que-tem-mais-de-32-caracteres';
test('sessão assinada, expirada e adulterada',()=>{const token=issueSession(1000);assert.equal(validSession(token,2000),true);assert.equal(validSession(token,1000+31*86400000),false);assert.equal(validSession(token+'x',2000),false);assert.equal(validSession(undefined),false)});
test('senha correta e incorreta',()=>{assert.equal(correctPassword(process.env.APP_PASSWORD),true);assert.equal(correctPassword('errada'),false)});
test('limita tentativas e reinicia a janela',()=>{for(let i=0;i<10;i++)assert.equal(canAttempt('test-ip',1000),true);assert.equal(canAttempt('test-ip',1001),false);assert.equal(canAttempt('test-ip',1000+900001),true)});
test('rejeita escrita de origem diferente',()=>{assert.equal(sameOrigin(new Request('https://ninho.example/api/items',{headers:{origin:'https://evil.example'}})),false);assert.equal(sameOrigin(new Request('https://ninho.example/api/items',{headers:{origin:'https://ninho.example'}})),true)});

test('aceita domínio Railway público atrás do proxy e rejeita origens externas',()=>{
 const oldDomain=process.env.RAILWAY_PUBLIC_DOMAIN,oldUrl=process.env.APP_URL;
 try {
  delete process.env.APP_URL;
  process.env.RAILWAY_PUBLIC_DOMAIN='nosso-ninho-production.up.railway.app';
  const request=origin=>new Request('http://localhost:3000/api/auth/login',{headers:{origin}});
  assert.equal(sameOrigin(request('https://nosso-ninho-production.up.railway.app')),true);
  for(const origin of ['https://evil.example','https://nosso-ninho-production.up.railway.app.evil.example','http://nosso-ninho-production.up.railway.app','https://nosso-ninho-production.up.railway.app:444','null'])assert.equal(sameOrigin(request(origin)),false);
  process.env.APP_URL='https://ninho.example';
  assert.equal(sameOrigin(request('https://ninho.example')),true);
  assert.equal(sameOrigin(request('https://nosso-ninho-production.up.railway.app')),false);
  process.env.APP_URL='invalid-origin';
  assert.equal(sameOrigin(request('https://ninho.example')),false);
 } finally {
  if(oldDomain===undefined)delete process.env.RAILWAY_PUBLIC_DOMAIN;else process.env.RAILWAY_PUBLIC_DOMAIN=oldDomain;
  if(oldUrl===undefined)delete process.env.APP_URL;else process.env.APP_URL=oldUrl;
 }
});
