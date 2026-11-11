import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createPool} from '../lib/database.mjs';
export async function migrate(){const pool=createPool();const client=await pool.connect();try{
 await client.query('BEGIN');
 await client.query('SELECT pg_advisory_xact_lock(20261110)');
 await client.query('CREATE TABLE IF NOT EXISTS ninho_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)');
 const name='001_items.sql';const result=await client.query('SELECT name FROM ninho_migrations WHERE name=$1',[name]);
 if(result.rowCount===0){await client.query(await readFile(new URL('../migrations/'+name,import.meta.url),'utf8'));await client.query('INSERT INTO ninho_migrations(name) VALUES($1)',[name]);}
 await client.query('COMMIT');console.log('Banco de dados pronto.');
 }catch(e){await client.query('ROLLBACK');throw e}finally{client.release();await pool.end()}}
if(process.argv[1]===fileURLToPath(import.meta.url))migrate().catch(()=>{console.error('Falha ao preparar o banco. Confira DATABASE_URL e a disponibilidade do PostgreSQL.');process.exitCode=1;});
