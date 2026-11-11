import {cookies} from 'next/headers';
import {COOKIE_NAME,validSession,sameOrigin} from './auth.mjs';
export async function authorize(req:Request){if(!(validSession((await cookies()).get(COOKIE_NAME)?.value)))return Response.json({error:'Entre para acessar o enxoval.'},{status:401});if(req.method!=='GET'&&!sameOrigin(req))return Response.json({error:'Origem não permitida.'},{status:403});return null;}
