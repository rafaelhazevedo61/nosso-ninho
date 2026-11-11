import {spawn} from 'node:child_process';
import {migrate} from './migrate.mjs';
import {assertConfig} from '../lib/auth.mjs';
try{assertConfig();await migrate();const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','0.0.0.0','--port',process.env.PORT||'3000'],{stdio:'inherit',env:process.env});for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));child.on('exit',code=>process.exit(code??1));}catch(e){console.error('Falha ao iniciar o Ninho. Confira DATABASE_URL, APP_PASSWORD e SESSION_SECRET.');console.error(e instanceof Error?e.message:'Erro de configuração.');process.exitCode=1;}
