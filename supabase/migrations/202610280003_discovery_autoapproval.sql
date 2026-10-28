-- Aprovação automática, mais categorias e contatos públicos.
-- Execute após as migrações 001 e 002. Preserva registros rejeitados.
alter table public.businesses
 add column if not exists phone text not null default '' check (phone='' or phone ~ '^\+55[1-9][0-9]{9,10}$'),
 add column if not exists whatsapp text not null default '' check (whatsapp='' or whatsapp ~ '^\+55[1-9][0-9]{9,10}$'),
 add column if not exists contact_email text not null default '' check (contact_email='' or (char_length(contact_email)<=254 and contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
 add column if not exists instagram text not null default '' check (instagram='' or instagram ~ '^[A-Za-z0-9._]{1,30}$');
alter table public.businesses drop constraint if exists businesses_category_check;
alter table public.businesses add constraint businesses_category_check check (category in ('Alimentação','Agricultura e agroecologia','Arquitetura e design','Arte e cultura','Artesanato','Beleza e estética','Casa e decoração','Comércio e varejo','Comunicação e marketing','Construção e reformas','Cooperativas e economia solidária','Educação','Esporte e lazer','Eventos','Jurídico e contabilidade','Livros e papelaria','Moda','Pets','Saúde e bem-estar','Serviços','Tecnologia','Transporte e entregas','Turismo e hospedagem','Outros'));
alter table public.businesses alter column status set default 'approved';
create or replace function public.register_business_from_auth()
returns trigger language plpgsql security definer set search_path = '' as $$
declare draft jsonb;
begin
 draft := new.raw_user_meta_data -> 'business_draft';
 if draft is null or jsonb_typeof(draft) <> 'object' or draft->>'consent' is distinct from 'on' then return new; end if;
 -- Apenas campos do formulário; proprietário e status vêm do servidor do Auth.
 begin
  insert into public.businesses(owner_id,name,description,category,city,state,website,phone,whatsapp,contact_email,instagram,status)
  values(new.id,btrim(draft->>'name'),btrim(draft->>'description'),draft->>'category',btrim(draft->>'city'),draft->>'state',coalesce(draft->>'website',''),coalesce(draft->>'phone',''),coalesce(draft->>'whatsapp',''),coalesce(draft->>'contact_email',''),coalesce(draft->>'instagram',''),'approved')
  on conflict (owner_id) do update set
   name=excluded.name, description=excluded.description, category=excluded.category,
   city=excluded.city, state=excluded.state, website=excluded.website,
   phone=excluded.phone, whatsapp=excluded.whatsapp, contact_email=excluded.contact_email, instagram=excluded.instagram;
 exception when check_violation or not_null_violation then
  -- Metadados adulterados não criam empresas nem impedem a criação da conta.
  return new;
 end;
 return new;
end;
$$;
revoke all on function public.register_business_from_auth() from public,anon,authenticated;

-- Não libera entradas anteriormente rejeitadas.
update public.businesses set status='approved' where status='pending';
