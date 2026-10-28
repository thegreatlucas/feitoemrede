# Feito em Rede

Uma plataforma para aproximar consumidores de empreendedores progressistas e conectar pessoas a oportunidades de trabalho.

## Objetivos do MVP

- Permitir que empreendedores se cadastrem e apresentem seus negócios.
- Ajudar consumidores a encontrar negócios por cidade, região e categoria.
- Exibir negócios em lista e preparar uma experiência de mapa com Google Maps.
- Receber denúncias de cadastros falsos ou informações suspeitas para análise da moderação.
- Criar um banco de talentos com perfis profissionais e oportunidades de emprego.

## Princípios do produto

- Participação política autodeclarada, sem inferir posicionamento por dados pessoais.
- Denúncias são privadas e passam por revisão antes de qualquer ação pública.
- Coletar apenas os dados necessários e permitir que cada pessoa controle o que publica.
- Perfis e anúncios precisam de mecanismos de revisão, atualização e remoção.

## Stack prevista

- **Aplicação:** Next.js e TypeScript, pronta para publicação na Vercel.
- **Dados e autenticação:** Supabase (opcional nesta fase de protótipo).
- **Mapa:** Google Maps Platform, condicionado à configuração de uma chave de API.

As integrações ainda não estão configuradas. Não inclua chaves ou segredos no repositório; use variáveis de ambiente locais e os painéis da Vercel/Supabase.

## Próximos passos

1. Definir identidade visual, regras de participação e política de moderação.
2. Construir as telas iniciais de descoberta, cadastro de negócio, denúncia e talentos.
3. Modelar dados e permissões no Supabase.
4. Integrar mapa e filtros geográficos com consentimento e localização aproximada.
5. Publicar uma versão de teste na Vercel e validar com a comunidade.

## Desenvolvimento

Este repositório começa como uma especificação do produto. A estrutura da aplicação e as integrações serão adicionadas nas próximas etapas.
