import {spawn} from 'node:child_process';
import {migrate} from './migrate.mjs';
import {assertConfig} from '../lib/auth.mjs';
try{assertConfig();await migrate();const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--webpack','--hostname','0.0.0.0','--port',process.env.PORT||'3000'],{stdio:'inherit'});for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));child.on('exit',code=>process.exit(code??1));}catch{console.error('Confira DATABASE_URL, APP_PASSWORD e SESSION_SECRET antes de iniciar.');process.exitCode=1;}
