import {getPool} from '@/lib/database.mjs';
export const dynamic='force-dynamic';
export async function GET(){try{await getPool().query('SELECT 1 FROM items LIMIT 1');return Response.json({status:'ok'})}catch{return Response.json({status:'unavailable'},{status:503})}}
