export function createRepository(pool){return {
 async list(){const r=await pool.query('SELECT payload FROM items ORDER BY created_at, id');return r.rows.map(r=>r.payload);},
 async save(item){await pool.query('INSERT INTO items (id,payload) VALUES ($1,$2::jsonb) ON CONFLICT(id) DO UPDATE SET payload=EXCLUDED.payload,updated_at=CURRENT_TIMESTAMP',[item.id,JSON.stringify(item)]);},
 async remove(id){await pool.query('DELETE FROM items WHERE id=$1',[id]);}
};}
