import {cookies} from 'next/headers';
import {COOKIE_NAME,sameOrigin} from '@/lib/auth.mjs';
export async function POST(req:Request){if(!sameOrigin(req))return Response.json({error:'Origem não permitida.'},{status:403});(await cookies()).delete(COOKIE_NAME);return Response.json({ok:true});}
