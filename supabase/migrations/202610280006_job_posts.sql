-- Vagas públicas; somente o proprietário de empresa publicada pode anunciar.
create table public.job_posts (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 business_id uuid not null references public.businesses(id) on delete cascade,
 title text not null check (char_length(title) between 3 and 120),
 description text not null check (char_length(description) between 40 and 5000),
 area text not null check (area in ('Administração','Atendimento e vendas','Comunicação e marketing','Construção e manutenção','Design e criação','Educação','Engenharia','Finanças e contabilidade','Gastronomia','Jurídico','Logística e transportes','Produção e indústria','Recursos humanos','Saúde e cuidados','Serviços gerais','Tecnologia','Turismo e eventos','Outras áreas')),
 city text not null check (char_length(city) between 2 and 80),
 state text not null check (state in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
 work_mode text not null check (work_mode in ('Presencial','Híbrido','Remoto')),
 contract_type text not null check (contract_type in ('CLT','Pessoa jurídica (PJ)','Temporário','Estágio','Aprendiz','Freelance','Cooperado','Outro')),
 salary text not null default '' check (char_length(salary)<=100),
 application_email text not null default '' check (application_email='' or (char_length(application_email)<=254 and application_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
 application_url text not null default '' check (application_url='' or (char_length(application_url)<=300 and application_url ~ '^https://')),
 expires_on date not null,
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (application_email<>'' or application_url<>'')
);
alter table public.job_posts enable row level security;
revoke all on public.job_posts from anon,authenticated;
grant select on public.job_posts to anon,authenticated;
grant delete on public.job_posts to authenticated;
grant insert (owner_id,business_id,title,description,area,city,state,work_mode,contract_type,salary,application_email,application_url,expires_on,is_active) on public.job_posts to authenticated;
grant update (title,description,area,city,state,work_mode,contract_type,salary,application_email,application_url,expires_on,is_active) on public.job_posts to authenticated;
create policy "job_public_read" on public.job_posts for select to anon,authenticated using (
 is_active and expires_on >= (now() at time zone 'America/Sao_Paulo')::date and exists(select 1 from public.businesses b where b.id=business_id and b.status='approved')
);
create policy "job_owner_read" on public.job_posts for select to authenticated using (owner_id=(select auth.uid()));
create policy "job_insert_own_business" on public.job_posts for insert to authenticated with check (
 owner_id=(select auth.uid()) and exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=(select auth.uid()) and b.status='approved')
);
create policy "job_update_own" on public.job_posts for update to authenticated using (owner_id=(select auth.uid())) with check (
 owner_id=(select auth.uid()) and (not is_active or exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=(select auth.uid()) and b.status='approved'))
);
create policy "job_delete_own" on public.job_posts for delete to authenticated using (owner_id=(select auth.uid()));
create function public.touch_job_post() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end; $$;
revoke all on function public.touch_job_post() from public,anon,authenticated;
create trigger touch_job_post before update on public.job_posts for each row execute function public.touch_job_post();
create index job_posts_business on public.job_posts(business_id,created_at desc);
create index job_posts_active on public.job_posts(expires_on,area,state) where is_active;
