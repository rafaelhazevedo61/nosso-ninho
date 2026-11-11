import test from 'node:test';
import assert from 'node:assert/strict';
import {issueSession,validSession,correctPassword,canAttempt,sameOrigin} from '../lib/auth.mjs';
process.env.APP_PASSWORD='senha-exclusiva-de-teste';process.env.SESSION_SECRET='segredo-de-teste-que-tem-mais-de-32-caracteres';
test('sessão assinada, expirada e adulterada',()=>{const token=issueSession(1000);assert.equal(validSession(token,2000),true);assert.equal(validSession(token,1000+31*86400000),false);assert.equal(validSession(token+'x',2000),false);assert.equal(validSession(undefined),false)});
test('senha correta e incorreta',()=>{assert.equal(correctPassword(process.env.APP_PASSWORD),true);assert.equal(correctPassword('errada'),false)});
test('limita tentativas e reinicia a janela',()=>{for(let i=0;i<10;i++)assert.equal(canAttempt('test-ip',1000),true);assert.equal(canAttempt('test-ip',1001),false);assert.equal(canAttempt('test-ip',1000+900001),true)});
test('rejeita escrita de origem diferente',()=>{assert.equal(sameOrigin(new Request('https://ninho.example/api/items',{headers:{origin:'https://evil.example'}})),false);assert.equal(sameOrigin(new Request('https://ninho.example/api/items',{headers:{origin:'https://ninho.example'}})),true)});
