import test from 'node:test';
import assert from 'node:assert/strict';
import {newDb} from 'pg-mem';
import {readFile} from 'node:fs/promises';
import {createRepository} from '../lib/repository.mjs';
const item={id:'test-item',name:'Berço',category:'Quarto',priority:'Essencial',phase:'Antes do nascimento',price:400,qty:2,bought:0,saved:100,paid:0,image:'https://example.com/berco.jpg',url:'https://example.com/berco',notes:''};
test('migração, cadastro, atualização sem duplicação, reserva, compra parcial e exclusão',async()=>{
 const db=newDb();db.public.none(await readFile(new URL('../migrations/001_items.sql',import.meta.url),'utf8'));
 const {Pool}=db.adapters.createPg();const pool=new Pool();const repo=createRepository(pool);
 try{await repo.save(item);assert.deepEqual(await repo.list(),[item]);await repo.save({...item,saved:200});assert.equal((await repo.list()).length,1);assert.equal((await repo.list())[0].saved,200);
 await repo.save({...item,bought:1,paid:90,saved:10});const saved=(await repo.list())[0];assert.equal(saved.bought,1);assert.equal(saved.paid,90);assert.equal(saved.qty-saved.bought,1);assert.equal(saved.url,item.url);assert.equal(saved.image,item.image);await repo.remove(item.id);assert.deepEqual(await repo.list(),[])}finally{await pool.end()}
});
