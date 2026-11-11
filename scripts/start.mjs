import {spawn} from 'node:child_process';
import {migrate} from './migrate.mjs';
import {assertConfig} from '../lib/auth.mjs';

let phase = 'configuração';
try {
  assertConfig();
  if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL no serviço da aplicação.');
  let url;
  try { url = new URL(process.env.DATABASE_URL); }
  catch { throw new Error('DATABASE_URL inválida. Use uma referência à variável do serviço PostgreSQL.'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname) {
    throw new Error('DATABASE_URL precisa ser uma URL de conexão PostgreSQL.');
  }
  phase = 'conexão com PostgreSQL e preparação das tabelas';
  console.log('Configuração validada. Conectando ao PostgreSQL...');
  await migrate();
  phase = 'inicialização do servidor';
  const child = spawn(process.execPath, [
    'node_modules/next/dist/bin/next', 'start', '--hostname', '0.0.0.0',
    '--port', process.env.PORT || '3000'
  ], {stdio:'inherit', env:process.env});
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>child.kill(signal));
  child.on('error',()=>{console.error('Não foi possível iniciar o processo Next.js.');process.exitCode=1;});
  child.on('exit',code=>process.exit(code??1));
} catch (error) {
  console.error('Falha ao iniciar o Ninho. Etapa: ' + phase + '.');
  if (phase === 'configuração') {
    console.error(error instanceof Error ? error.message : 'Confira as variáveis de ambiente.');
  } else {
    const codes = new Set();
    const seen = new Set();
    function collect(value) {
      if (!value || typeof value !== 'object' || seen.has(value)) return;
      seen.add(value);
      if (typeof value.code === 'string' && /^[A-Z0-9_]{2,40}$/.test(value.code)) codes.add(value.code);
      if (Array.isArray(value.errors)) value.errors.forEach(collect);
      collect(value.cause);
    }
    collect(error);
    console.error('Código(s) do erro: ' + ([...codes].join(', ') || 'não informado'));
    if (codes.has('ECONNREFUSED')) console.error('Conexão recusada. Confira se o PostgreSQL está online e se DATABASE_URL referencia o serviço correto.');
    else if (codes.has('ENOTFOUND') || codes.has('EAI_AGAIN')) console.error('Endereço do banco não encontrado. Confira a referência DATABASE_URL e a rede privada do projeto.');
    else if (codes.has('28P01')) console.error('Autenticação do banco recusada. Use a referência atual DATABASE_URL do serviço PostgreSQL.');
    else if (codes.has('ETIMEDOUT')) console.error('Tempo de conexão esgotado. Confira disponibilidade e conectividade do PostgreSQL.');
    else console.error('Confira os logs do PostgreSQL e a referência DATABASE_URL da aplicação.');
  }
  process.exitCode = 1;
}
