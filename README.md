# Feito em Rede

Uma plataforma para aproximar consumidores de empreendedores e fortalecer uma economia local, diversa e solidária. Interface em português, com referências construtivistas, cores da comunicação popular brasileira e layout responsivo. Projeto independente, sem vínculo institucional com partidos.

## O que está implementado

- Catálogo com publicação automática, busca por nome/cidade/descrição e filtro entre 24 categorias.
- Login separado do cadastro, conta por e-mail e senha com Supabase Auth e sessão SSR, sem confirmação por e-mail.
- Cadastro de um negócio por conta: nome, descrição, categoria, cidade, UF e site/rede social HTTPS opcional.
- Consentimento de publicação automática, painel para editar dados/contatos e remover o negócio. WhatsApp, telefone, e-mail comercial, Instagram e site aparecem como links públicos no catálogo. Logo e foto da fachada podem ser enviados no cadastro ou depois pelo painel, e aparecem nos cartões do catálogo.
- Moderação administrativa no dashboard Supabase, sem chave administrativa na aplicação.
- Validação no servidor, proteção de ações do Next.js, políticas de acesso no banco (RLS) e cabeçalhos de segurança.

Mapa e recebimento interno de denúncias, recuperação de senha ainda não estão implementados. O catálogo usa paginação de 12 negócios por página; a busca por nome, descrição e cidade e o filtro por categoria são aplicados no banco a todos os cadastros aprovados. Não há dados fictícios exibidos como reais.

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
3. Aplique também a nova migração `supabase/migrations/202610280002_signup_business.sql`. Ela bloqueia INSERT direto na tabela (inclusive autenticado) e cria um trigger do Auth que valida e registra a empresa com proprietário fixado pela identidade do usuário. Aplique em seguida `supabase/migrations/202610280003_discovery_autoapproval.sql` para contatos, novas categorias, edição e publicação automática. Ela publica os cadastros pendentes e preserva os rejeitados. Não reaplique as migrações anteriores em bancos já atualizados.
4. Em **Authentication → Sign In / Providers → Email**, **desative Confirm email**. Configure uma política de senhas de pelo menos 10 caracteres. Esse controle é do projeto remoto; não pode ser desligado apenas pelo código do site. Contas antigas ainda não confirmadas podem precisar ser confirmadas manualmente pelo operador após verificar a solicitação.
5. O cadastro agora segue: dados da empresa → e-mail e senha → criação da conta e acesso automático ao painel. Os dados são enviados como rascunho do Auth; o banco cadastra a empresa automaticamente. A publicação no catálogo é automática; a moderação pode rejeitar cadastros que violem as regras.
6. Enquanto o projeto remoto ainda exigir confirmação, a aplicação não cria novas contas por esse fluxo e mostra uma mensagem temporária. Assim não deixa a pessoa presa a um link de confirmação.
7. Faça um teste real com uma conta sua: cadastrar empresa e acesso → entrar automaticamente no painel → sair → entrar pelo login → verificar a publicação automática no catálogo → remover no painel. Não use contas ou e-mails de terceiros.

A nova migração impede gravação direta na tabela; as APIs públicas de autenticação do Supabase continuam funcionando. Nenhum site pode impedir todas as requisições HTTP, pois o próprio formulário depende delas. Server Actions validam os dados no servidor e aplicam a proteção de origem do Next.js; o campo oculto do formulário descarta automações simples e não substitui CAPTCHA ou limites do provedor. Não é usada uma chave administrativa no navegador ou no fluxo de cadastro.

### Moderação

Os novos cadastros são publicados automaticamente. No **Table Editor → businesses**, operadores administrativos podem alterar `status` para `rejected` para retirar um negócio do catálogo. Cadastros rejeitados não voltam a ser públicos ao editar seus contatos. Proprietário, status e datas não são definidos pelo formulário. Cada conta possui um único negócio, editável pelo painel. A migração de aprovação automática libera registros pendentes, preservando os rejeitados.

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

### Configuração de build da Vercel

O arquivo `vercel.json` fixa o framework Next.js, o comando `npm run build` e a saída `.next`. Isso evita o erro “No Output Directory named public found” em projetos importados anteriormente como sites estáticos. No painel da Vercel, mantenha o diretório raiz na raiz do repositório e o preset Next.js; remova configurações antigas de saída `public`. Não use exportação estática: autenticação e ações de cadastro precisam do servidor Next.js.

### Configuração pública incluída no deploy

`vercel.json` fornece a URL e a chave **anon** deste projeto tanto ao build quanto às funções da Vercel. Esses identificadores são públicos por definição e não concedem acesso administrativo: a autorização continua nas políticas RLS do Supabase. Nenhuma chave `service_role` ou secret key deve ser adicionada a esse arquivo. Ao trocar de projeto, atualize as duas configurações (`env` e `build.env`) juntas. As credenciais pessoais e administrativas continuam fora do Git.

## Imagens do negócio

A migração `202610280004_business_images.sql` cria o bucket público `business-images`, as colunas de imagem e as regras de escrita por proprietário. Aplique depois das migrações 001, 002 e 003 em um projeto novo; não reaplique as já instaladas. Cada conta pode enviar logo e fachada em JPG, PNG ou WebP de até 1,5 MB e 16 megapixels por arquivo. O servidor valida os bytes, reduz dimensões, converte para WebP e remove metadados. SVG e animações são recusados. O limite do formulário é 4 MB, mantendo a soma dos dois arquivos abaixo do limite da Vercel.

Os caminhos são gerados pelo servidor, vinculados ao UUID do proprietário e validados no banco. Apenas o proprietário autenticado pode gravar ou remover arquivos na própria pasta; a leitura das imagens é pública por consentimento. O painel permite substituir/remover fotos e editar os contatos. Não são usadas chaves administrativas no upload.

## Banco de talentos

`/talentos` apresenta o banco de recolocação. Visitantes veem apenas a apresentação; perfis, contatos e currículos exigem login. `/criar-conta` cria uma conta independente, sem obrigar o cadastro de um negócio. `/talentos/meu-perfil` permite criar/editar perfil, substituir o PDF, ocultar o perfil ou excluir perfil e currículo. O cabeçalho informa a conta autenticada e permite sair.

Aplique `202610280005_talent_bank.sql` após as anteriores em projetos novos. Ela cria `talent_profiles` com RLS, permissões por proprietário e leitura apenas para usuários autenticados, além do bucket **privado** `talent-cvs`. Currículos aceitos: PDF válido, sem senha, até 2 MB e 20 páginas. O download passa por `/talentos/[id]/curriculo`, verifica sessão e RLS em cada solicitação e retorna anexo com `Cache-Control: private, no-store`. Não são gerados links públicos ou URLs assinadas de currículo.

Filtros: texto (nome, cargo, cidade, região, habilidades), área, UF e modalidade (presencial, híbrido, remoto), com paginação. O perfil informa nome, título profissional, experiência, habilidades, cidade/UF, região de interesse, modalidades aceitas, e-mail profissional, telefone/WhatsApp e links de LinkedIn/portfólio. Não são coletados apoio político ou motivo de demissão. Páginas de talentos não são indexáveis e os seus conteúdos estão marcados para mascaramento no Clarity. Contatos dos negócios continuam públicos por consentimento; os dados profissionais seguem a política de acesso autenticado.

## Vagas e orientação trabalhista

`/vagas` oferece anúncios públicos das empresas publicadas, com filtros por texto, área, UF e modalidade. `/painel/vagas` permite anunciar, editar, encerrar e remover vagas da própria empresa. Os anúncios incluem cargo, atividades/requisitos, contratação, remuneração opcional, cidade/UF, modalidade, prazo e e-mail ou link de candidatura. A candidatura acontece diretamente no canal da empresa; a plataforma não envia o currículo automaticamente. Vagas encerradas, vencidas ou de empresas retiradas do catálogo não aparecem ao público. A migração `202610280006_job_posts.sql` aplica propriedade, RLS e expiração com data de São Paulo.

`/denuncias` reúne canais oficiais do MPT, do MTE/gov.br e orientação pelo 158, além de informações gerais sobre preservação lícita de provas e procura de sindicato ou assistência jurídica. A página não recebe nem publica relatos ou arquivos. O enquadramento jurídico depende da situação concreta; não é afirmado que cada caso já teve sua ilegalidade reconhecida. O acesso externo aos órgãos pode depender de identificação e requisitos do próprio serviço.
