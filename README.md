# Feito em Rede

Uma plataforma para aproximar consumidores de empreendedores e fortalecer uma economia local, diversa e solidária. Interface em português, com referências construtivistas, cores da comunicação popular brasileira e layout responsivo. Projeto independente, sem vínculo institucional com partidos.

## O que está implementado

- Catálogo de negócios aprovados, busca textual e filtro por categoria.
- Conta por e-mail e senha com Supabase Auth, confirmação por e-mail e sessão SSR.
- Cadastro de um negócio por conta: nome, descrição, categoria, cidade, UF e site/rede social HTTPS opcional.
- Consentimento de publicação, revisão antes de publicar e painel para acompanhar ou remover o negócio. Para corrigir os dados nesta versão, remova e cadastre novamente.
- Moderação administrativa no dashboard Supabase, sem chave administrativa na aplicação.
- Validação no servidor, proteção de ações do Next.js, políticas de acesso no banco (RLS) e cabeçalhos de segurança.

Mapa, talentos/vagas, upload de imagens, denúncias internas, recuperação de senha e edição direta ainda não estão implementados. O catálogo usa paginação de 12 negócios por página; a busca por nome, descrição e cidade e o filtro por categoria são aplicados no banco a todos os cadastros aprovados. Não há dados fictícios exibidos como reais.

## Desenvolvimento

Requer Node.js 24.5 ou mais recente da série 24 e npm. Os scripts preservam o proxy de rede fornecido pelo ambiente de nuvem por meio de `--use-env-proxy`, mantendo a validação TLS. Use o checkout existente em `/workspace/feitoemrede`; cada tarefa de nuvem já é isolada, portanto não crie worktrees por padrão.

```sh
cd /workspace/feitoemrede
npm ci
cp .env.example .env.local # apenas se ainda não existir
# Preencha as variáveis públicas no arquivo local, sem versioná-lo.
npm run dev
```

Sem as variáveis, a interface funciona, mas o cadastro fica explicitamente indisponível. Não há persistência simulada em localStorage.

```sh
npm test
npm run typecheck
npm run build
npm start
```

Os testes executam validação dos campos e a migração SQL em PostgreSQL embarcado (PGlite), com usuários e papéis simulados. Verificam acesso anônimo, isolamento de usuários, confirmação de e-mail, moderação, unicidade e remoção. Não substituem o teste de autenticação em um projeto Supabase real.

## Conectar o Supabase

1. Crie um projeto Supabase. Em **SQL Editor**, execute o conteúdo de `supabase/migrations/202610280001_businesses.sql` uma única vez, com uma conta administrativa. A migração cria a tabela, índices, privilégios e RLS. Não reaplique a migração sobre uma tabela existente sem planejar uma migração incremental.
2. Copie a **Project URL** e a **Publishable key** para `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Essas duas informações são públicas por definição; a proteção dos registros depende de RLS. Nunca use uma chave `service_role` ou secret key na aplicação.
3. Em **Authentication → Providers → Email**, mantenha a confirmação de e-mail ativada. Configure uma política de senhas de pelo menos 10 caracteres. A política SQL também impede o envio de negócios por usuários não confirmados.
4. Em **Authentication → URL Configuration**, configure o Site URL para o domínio definitivo e adicione os endereços autorizados de desenvolvimento e produção. Não autorize curingas amplos para previews não confiáveis.
5. Em **Authentication → Email Templates → Confirm signup**, use um link de confirmação SSR:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup"
  >Confirmar minha conta</a
>
```

6. Configure um provedor SMTP para entrega de e-mails em produção, respeitando os limites e a proteção contra abuso do Supabase. Antes de abrir inscrições públicas, avalie CAPTCHA no Auth e regras de limite de requisições apropriadas ao tráfego.
7. Reinicie o servidor após alterar variáveis e faça um teste real: criar conta → receber e-mail → confirmar → cadastrar negócio → conferir status **Em análise** no painel → aprovar no dashboard → verificar no catálogo → remover pelo painel e confirmar que desapareceu.

### Moderação

No **Table Editor → businesses**, revise os cadastros com `status = pending` e altere para `approved` ou `rejected`. Apenas operadores com acesso administrativo ao projeto fazem essa alteração. Usuários da aplicação não têm permissão para alterar status, identidade do proprietário ou datas. Por enquanto, a conta tem um único negócio; não publique conteúdo discriminatório, fraudulento ou informações pessoais desnecessárias.

## Publicar na Vercel

1. Importe este repositório na Vercel, selecione o diretório raiz do projeto e o preset **Next.js**. Use Node.js 24 e o lockfile existente (`npm ci`, build `npm run build`).
2. Configure as duas variáveis públicas do Supabase nas configurações do projeto Vercel. Não coloque credenciais administrativas no repositório ou no navegador.
3. Configure o domínio, publique e atualize o Site URL e os endereços permitidos no Supabase. Para previews que precisem de autenticação, prefira projetos/bancos separados de produção.
4. Valide o fluxo completo descrito acima no domínio HTTPS definitivo. A Vercel fornece hospedagem, HTTPS e controles de tráfego; as permissões e o isolamento dos dados são responsabilidade do Supabase/RLS e da aplicação.

A implantação e a criação dos recursos remotos não são automáticas neste repositório. Nenhum projeto remoto é criado sem a conexão da conta correspondente.

## Antes de abrir ao público

Disponibilize o responsável pelo tratamento dos dados e um canal real para denúncias, suporte, recuperação de acesso e solicitações de exclusão da conta. Atualize `/privacidade` com esses dados e revise os termos conforme a operação real. Remover o negócio no painel exclui seu registro público; a exclusão da conta de autenticação ainda é feita pelo operador no Supabase mediante solicitação verificada. Não coletamos filiação ou opinião política. Defina também a política operacional de moderação, retenção e backups.

## Compatibilidade com a chave anon

A aplicação aceita `NEXT_PUBLIC_ANON` (configurada neste ambiente), `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, nessa ordem de prioridade. Basta preencher uma dessas chaves públicas, sempre do mesmo projeto de `NEXT_PUBLIC_SUPABASE_URL`. A seleção é compartilhada entre as páginas e a renovação de sessão. Na Vercel, configure também a variável escolhida e faça um novo build quando alterar variáveis públicas. `NEXT_SECRET_SERVICE_ROLE` não é usada pela aplicação.
