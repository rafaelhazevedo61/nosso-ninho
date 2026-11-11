import { z } from 'zod';
const externalUrl=z.string().max(3000).refine(v=>{if(v==='')return true;try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password}catch{return false}},'Use um link completo começando com http:// ou https://.');
export const idSchema=z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);
export const itemSchema=z.object({
 id:idSchema,name:z.string().trim().min(1).max(120),
 category:z.enum(['Quarto','Roupinhas','Higiene e banho','Alimentação','Passeio','Outros']),
 priority:z.enum(['Essencial','Importante','Opcional']),
 phase:z.enum(['Antes do nascimento','0–3 meses','3–6 meses','6–12 meses','Após 1 ano']),
 price:z.number().finite().min(0).max(10000000),qty:z.number().int().min(1).max(100000),bought:z.number().int().min(0),
 saved:z.number().finite().min(0).max(100000000),paid:z.number().finite().min(0).max(100000000),
 image:externalUrl.default(''),url:externalUrl.default(''),notes:z.string().max(10000).default('')
}).refine(i=>i.bought<=i.qty,'A quantidade adquirida não pode superar a quantidade planejada.');
