-- Execute no SQL Editor do seu projeto Supabase, uma única vez.
create function public.is_confirmed_user() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from auth.users where id = (select auth.uid()) and email_confirmed_at is not null) $$;
revoke all on function public.is_confirmed_user() from public;
grant execute on function public.is_confirmed_user() to authenticated;

create table public.businesses (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null unique references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 3 and 100),
 description text not null check (char_length(description) between 20 and 1000),
 category text not null check (category in ('Alimentação','Arte e cultura','Moda','Serviços','Tecnologia','Saúde e bem-estar','Educação','Outros')),
 city text not null check (char_length(city) between 2 and 80),
 state text not null check (state in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
 website text check (website is null or website = '' or (website ~ '^https://' and char_length(website) <= 300)),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 consent_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
alter table public.businesses enable row level security;
revoke all on public.businesses from anon, authenticated;
grant select on public.businesses to anon, authenticated;
grant insert (owner_id,name,description,category,city,state,website) on public.businesses to authenticated;
grant delete on public.businesses to authenticated;
create policy "Approved businesses are public" on public.businesses for select to anon,authenticated using (status = 'approved');
create policy "Owners can view their submissions" on public.businesses for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Confirmed users can submit their own business" on public.businesses for insert to authenticated with check ((select auth.uid()) = owner_id and status = 'pending' and (select public.is_confirmed_user()));
create policy "Owners can delete their business" on public.businesses for delete to authenticated using ((select auth.uid()) = owner_id);
create index businesses_public_recent on public.businesses(created_at desc) where status = 'approved';
create index businesses_category on public.businesses(category) where status = 'approved';
-- Moderação: use o dashboard do Supabase com acesso administrativo para alterar
-- status para approved ou rejected. Nenhuma chave administrativa vai para o app.
