-- Perfis e currículos acessíveis somente com login.
create table public.talent_profiles (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null check (char_length(full_name) between 3 and 100),
 headline text not null check (char_length(headline) between 3 and 120),
 summary text not null check (char_length(summary) between 20 and 2000),
 area text not null check (area in ('Administração','Atendimento e vendas','Comunicação e marketing','Construção e manutenção','Design e criação','Educação','Engenharia','Finanças e contabilidade','Gastronomia','Jurídico','Logística e transportes','Produção e indústria','Recursos humanos','Saúde e cuidados','Serviços gerais','Tecnologia','Turismo e eventos','Outras áreas')),
 city text not null check (char_length(city) between 2 and 80),
 state text not null check (state in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
 region text not null default '' check (char_length(region)<=120),
 work_modes text[] not null check (cardinality(work_modes) between 1 and 3 and work_modes <@ array['Presencial','Híbrido','Remoto']::text[]),
 skills text not null default '' check (char_length(skills)<=500),
 contact_email text not null check (char_length(contact_email)<=254 and contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 phone text not null default '' check (phone='' or phone ~ '^\+55[1-9][0-9]{9,10}$'),
 linkedin text not null default '' check (linkedin='' or (char_length(linkedin)<=300 and linkedin ~ '^https://(www\.)?linkedin\.com(/|$)')),
 portfolio text not null default '' check (portfolio='' or (char_length(portfolio)<=300 and portfolio ~ '^https://')),
 resume_path text not null check (split_part(resume_path,'/',1)=owner_id::text and resume_path ~ '^[0-9a-f-]{36}/cv-[0-9a-f-]{36}\.pdf$'),
 is_active boolean not null default true,
 consent_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.talent_profiles enable row level security;
revoke all on public.talent_profiles from anon,authenticated;
grant select,delete on public.talent_profiles to authenticated;
grant insert (owner_id,full_name,headline,summary,area,city,state,region,work_modes,skills,contact_email,phone,linkedin,portfolio,resume_path,is_active) on public.talent_profiles to authenticated;
grant update (full_name,headline,summary,area,city,state,region,work_modes,skills,contact_email,phone,linkedin,portfolio,resume_path,is_active) on public.talent_profiles to authenticated;
create policy "talent_authenticated_read" on public.talent_profiles for select to authenticated using (is_active or owner_id=(select auth.uid()));
create policy "talent_insert_own" on public.talent_profiles for insert to authenticated with check (owner_id=(select auth.uid()));
create policy "talent_update_own" on public.talent_profiles for update to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));
create policy "talent_delete_own" on public.talent_profiles for delete to authenticated using (owner_id=(select auth.uid()));
create function public.touch_talent_profile() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end; $$;
revoke all on function public.touch_talent_profile() from public,anon,authenticated;
create trigger touch_talent_profile before update on public.talent_profiles for each row execute function public.touch_talent_profile();
create index talent_profiles_area on public.talent_profiles(area) where is_active;
create index talent_profiles_state on public.talent_profiles(state) where is_active;
create index talent_profiles_recent on public.talent_profiles(updated_at desc) where is_active;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('talent-cvs','talent-cvs',false,2000000,array['application/pdf'])
 on conflict(id) do update set public=false,file_size_limit=2000000,allowed_mime_types=array['application/pdf'];
create policy "talent_cvs_read_authenticated" on storage.objects for select to authenticated using (
 bucket_id='talent-cvs' and ((storage.foldername(name))[1]=(select auth.uid())::text or exists(select 1 from public.talent_profiles p where p.resume_path=name and p.is_active))
);
create policy "talent_cvs_insert_own" on storage.objects for insert to authenticated with check (
 bucket_id='talent-cvs' and (storage.foldername(name))[1]=(select auth.uid())::text and name ~ '^[0-9a-f-]{36}/cv-[0-9a-f-]{36}\.pdf$'
);
create policy "talent_cvs_delete_own" on storage.objects for delete to authenticated using (
 bucket_id='talent-cvs' and (storage.foldername(name))[1]=(select auth.uid())::text
);
