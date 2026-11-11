# Ninho — Railway + PostgreSQL

Planejador de enxoval responsivo para celular e computador. React, TypeScript, Next.js e PostgreSQL. Não depende de Cloudflare D1, R2, Workers ou ChatGPT.

## Recursos

- Cadastro de nome, categoria, prioridade, fase, quantidade, preço, link do produto e link externo da imagem.
- Reservas por item, percentuais e resumo financeiro.
- Compras parciais, presentes e listas de interesse/adquiridos.
- Cartões e lista simples; preferência salva no navegador.
- Edição, exclusão, busca, filtros e exportação JSON.
- Login com senha compartilhada da família e sessão de 30 dias. Os itens são compartilhados por todos que conhecem a senha; não há contas individuais.
- Imagens são exibidas diretamente da URL informada. O site não baixa nem guarda arquivos. Alguns fornecedores bloqueiam exibição externa; nesses casos, use outro endereço.

## Publicar no Railway

1. Extraia o ZIP e envie os arquivos desta pasta para um repositório GitHub. Inclua arquivos como `.gitignore` e `.dockerignore`; nunca envie `.env` ou senhas. O `Dockerfile` precisa estar na raiz do repositório (ou configure a Root Directory no Railway).
2. No Railway, crie um projeto e adicione um serviço PostgreSQL.
3. No mesmo projeto, crie o serviço da aplicação a partir do repositório GitHub. O `railway.json` seleciona o Dockerfile.
4. Nas Variables **da aplicação**, configure:

| Variável | Valor |
| --- | --- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` — referência ao serviço de banco; se ele tiver outro nome, selecione-o no editor de referências do Railway. |
| `APP_PASSWORD` | Uma senha exclusiva com pelo menos 12 caracteres. |
| `SESSION_SECRET` | Uma chave aleatória com pelo menos 32 caracteres. |

Para gerar a chave no seu computador:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Não coloque essas variáveis no código, no Dockerfile nem em variáveis `NEXT_PUBLIC_`. Elas só são necessárias em execução; o build não precisa acessar o banco.

5. Faça o deploy. Na inicialização, a aplicação aplica a migração automaticamente, com transação e bloqueio para evitar execução simultânea. Não é necessário abrir o banco manualmente para criar tabelas.
6. Em Networking, gere um domínio público para a aplicação. Use a porta fornecida pelo Railway; o servidor escuta em `0.0.0.0` e respeita `PORT`.
7. Abra o endereço HTTPS e entre com a senha da família. Abra o mesmo endereço e use a mesma senha no celular e no computador.

O healthcheck é `/api/health`; ele verifica a disponibilidade da tabela de itens. Se falhar, confira se `DATABASE_URL` referencia o serviço PostgreSQL e se os dois serviços estão no mesmo projeto/ambiente. Use a URL privada interna do banco entre os serviços. O driver respeita os parâmetros de TLS da URL; o projeto não desativa a verificação de certificados.

O site publicado anteriormente no ChatGPT continua separado. Este ZIP não publica nada automaticamente em sua conta Railway e não leva suas credenciais.

## Rodar localmente

Requisitos: Node.js 22.13+ e PostgreSQL. Opcionalmente, Docker Compose apenas para o banco:

```sh
docker compose up -d
```

Copie `.env.example` para `.env`, configure as três variáveis e execute:

```sh
npm ci
npm run dev
```

Abra `http://localhost:3000`. O banco e a tabela são preparados automaticamente. Para testar em modo de produção:

```sh
npm run build
npm start
```

No Railway use HTTPS. Em produção, o cookie exige HTTPS; para testar a sessão em HTTP numa rede local, use `npm run dev`. Com celular e computador no mesmo Wi-Fi, abra `http://IP-DO-COMPUTADOR:3000` e permita a porta na rede privada do firewall, se necessário. Não exponha o servidor de desenvolvimento à internet.

## Levar os itens do site anterior

O novo PostgreSQL começa vazio. Para copiar os itens:

1. No Ninho anterior, clique em **Exportar lista** para baixar `nosso-enxoval.json`.
2. Prepare o novo banco e configure `DATABASE_URL` para o banco de destino.
3. Execute:

```sh
npm run db:import -- caminho/para/nosso-enxoval.json
```

O importador valida todos os itens antes de gravar e usa uma transação. IDs já existentes não são sobrescritos: reexecutar não duplica itens. Reservas, quantidades, valores e links externos são preservados. Links antigos `/api/images...` são removidos com aviso, pois dependem do armazenamento anterior; substitua-os por URLs externas.

Para importar no banco Railway a partir do seu computador, use temporariamente a URL externa de conexão do PostgreSQL no `.env` local; a URL privada só funciona dentro da rede Railway. Não compartilhe essa URL. Depois, volte a configuração local ao banco de desenvolvimento. O serviço da aplicação deve continuar com a referência privada configurada no Railway.

## Estrutura

- `app/page.tsx`: interface e regras do planejamento.
- `app/globals.css`: estilos responsivos.
- `app/login`: tela de acesso.
- `app/api/items`: operações autenticadas dos produtos.
- `app/api/auth`: login e saída.
- `lib/validation.mjs`: validação dos itens e links HTTP/HTTPS.
- `lib/repository.mjs`: consultas parametrizadas para PostgreSQL.
- `lib/auth.mjs`: senha, cookies assinados e limite básico de tentativas por processo.
- `migrations` e `scripts/migrate.mjs`: banco e controle de migrações.
- `Dockerfile` e `railway.json`: publicação.
- `.env.example`: configuração sem credenciais.

A senha compartilhada é adequada a este enxoval familiar. Não há recuperação de senha pela interface: altere `APP_PASSWORD` nas variáveis do serviço. Para invalidar sessões existentes, altere também `SESSION_SECRET`. Evite múltiplas réplicas se depender do limite de login em memória; para ampliar para vários usuários, implemente contas e limite distribuído.

## Validação

```sh
npm test
npm run typecheck
npm run build
npm run test:smoke
```

Os testes cobrem validação, sessão/senha e consultas do repositório com `pg-mem` (emulador PostgreSQL). Eles não substituem uma conexão real ao PostgreSQL nem um deploy de verificação na sua conta Railway. Não há banco de produção nem credenciais neste pacote.

Referências oficiais:
- https://railway.com/guides/nextjs
- https://docs.railway.com/databases/postgresql
- https://nextjs.org/docs/app/getting-started/deploying

Também foram verificados o build de produção, TypeScript e um teste HTTP com o servidor real Next.js: login, cookies de sessão, bloqueio de APIs sem login, validação, rejeição de origem externa, healthcheck com banco indisponível e saída. A conexão com PostgreSQL real e o build Docker no Railway ainda precisam ser verificados no seu ambiente.
