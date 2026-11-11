import {cookies} from 'next/headers';
import {assertConfig,COOKIE_NAME,SESSION_SECONDS,issueSession,correctPassword,canAttempt,resetAttempts,sameOrigin} from '@/lib/auth.mjs';
export const runtime='nodejs';
export async function POST(req:Request){if(!sameOrigin(req))return Response.json({error:'Origem não permitida.'},{status:403});try{assertConfig()}catch{return Response.json({error:'Configure a senha e a chave de sessão no servidor.'},{status:503})}
 const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||'local';
 if(!canAttempt(ip))return Response.json({error:'Muitas tentativas. Tente novamente em 15 minutos.'},{status:429});
 let password;try{({password}=await req.json())}catch{return Response.json({error:'Requisição inválida.'},{status:400})}
 if(!correctPassword(password))return Response.json({error:'Senha incorreta.'},{status:401});
 resetAttempts(ip);(await cookies()).set(COOKIE_NAME,issueSession(),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:SESSION_SECONDS,path:'/'});return Response.json({ok:true});
}
