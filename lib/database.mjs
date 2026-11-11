import pg from 'pg';
export function createPool(){
 if(!process.env.DATABASE_URL)throw new Error('Configure DATABASE_URL.');
 return new pg.Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:10000,idleTimeoutMillis:30000});
}
let pool;
export function getPool(){if(!pool){pool=createPool();pool.on('error',()=>console.error('Conexão ociosa do PostgreSQL interrompida.'));}return pool;}
