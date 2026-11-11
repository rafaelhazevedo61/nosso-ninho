import {getPool} from '@/lib/database.mjs';
import {createRepository} from '@/lib/repository.mjs';
import {itemSchema,idSchema} from '@/lib/validation.mjs';
import {authorize} from '@/lib/request-auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function fail(){return Response.json({error:'Não foi possível acessar o banco de dados. Tente novamente.'},{status:503})}
export async function GET(req:Request){const denied=await authorize(req);if(denied)return denied;try{return Response.json(await createRepository(getPool()).list(),{headers:{'Cache-Control':'no-store'}})}catch{return fail()}}
export async function POST(req:Request){const denied=await authorize(req);if(denied)return denied;let data;try{data=await req.json()}catch{return Response.json({error:'JSON inválido.'},{status:400})}const parsed=itemSchema.safeParse(data);if(!parsed.success)return Response.json({error:parsed.error.issues[0]?.message||'Confira os dados do item.'},{status:400});try{await createRepository(getPool()).save(parsed.data);return Response.json({ok:true})}catch{return fail()}}
export async function DELETE(req:Request){const denied=await authorize(req);if(denied)return denied;let id;try{const body=await req.json();id=idSchema.parse(body.id)}catch{return Response.json({error:'Item inválido.'},{status:400})}try{await createRepository(getPool()).remove(id);return Response.json({ok:true})}catch{return fail()}}
