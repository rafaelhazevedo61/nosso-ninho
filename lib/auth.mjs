import {createHmac,randomBytes,timingSafeEqual,scryptSync} from 'node:crypto';
export const COOKIE_NAME='ninho_session';
export const SESSION_SECONDS=60*60*24*30;
export function assertConfig(){if(!process.env.APP_PASSWORD||process.env.APP_PASSWORD.length<12)throw Error('Configure APP_PASSWORD com pelo menos 12 caracteres.');if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32)throw Error('Configure SESSION_SECRET com pelo menos 32 caracteres.');}
function sign(v){return createHmac('sha256',process.env.SESSION_SECRET).update(v).digest('base64url');}
export function issueSession(now=Date.now()){assertConfig();const payload=Buffer.from(JSON.stringify({exp:now+SESSION_SECONDS*1000,nonce:randomBytes(16).toString('hex')})).toString('base64url');return payload+'.'+sign(payload);}
export function validSession(token,now=Date.now()){try{assertConfig();if(typeof token!=='string'||token.length>1000)return false;const [payload,signature,...extra]=token.split('.');if(!payload||!signature||extra.length)return false;const expected=Buffer.from(sign(payload));const received=Buffer.from(signature);if(expected.length!==received.length||!timingSafeEqual(expected,received))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString());return Number.isFinite(data.exp)&&data.exp>now;}catch{return false}}
export function correctPassword(value){assertConfig();if(typeof value!=='string'||value.length>1024)return false;const salt=process.env.SESSION_SECRET;return timingSafeEqual(scryptSync(value,salt,32),scryptSync(process.env.APP_PASSWORD,salt,32));}
// Limite por processo; mantém o login simples para uma única família.
const attempts=new Map();
export function canAttempt(key,now=Date.now()){for(const [k,v] of attempts)if(v.until<=now)attempts.delete(k);let v=attempts.get(key);if(!v){if(attempts.size>=10000)return false;v={count:0,until:now+900000};attempts.set(key,v)}return ++v.count<=10;}
export function resetAttempts(key){attempts.delete(key)}
export function sameOrigin(req){const origin=req.headers.get('origin');if(!origin)return true;try{return new URL(origin).host===new URL(req.url).host}catch{return false}}
