import test from 'node:test';
import assert from 'node:assert/strict';
import {itemSchema} from '../lib/validation.mjs';
export const item={id:'test-item',name:'Berço',category:'Quarto',priority:'Essencial',phase:'Antes do nascimento',price:400,qty:2,bought:0,saved:100,paid:0,image:'https://example.com/berco.jpg',url:'https://example.com/berco',notes:''};
test('aceita item com link externo e reserva',()=>assert.deepEqual(itemSchema.parse(item),item));
test('rejeita links de script, upload antigo e credenciais',()=>{for(const image of ['javascript:alert(1)','/api/images?id=old','https://user:secret@example.com/img'])assert.equal(itemSchema.safeParse({...item,image}).success,false)});
test('permite links vazios, presentes e compra parcial',()=>{assert.ok(itemSchema.safeParse({...item,url:'',image:'',bought:1,paid:0}).success)});
test('rejeita números e quantidades inválidos',()=>{for(const patch of [{qty:1.5},{price:-1},{saved:NaN},{bought:3},{paid:Infinity}])assert.equal(itemSchema.safeParse({...item,...patch}).success,false)});
