-- Aplique esta NOVA migração após 202610280001. Não reaplique a anterior.
-- O cadastro guarda um rascunho no Auth; a empresa é cadastrada automaticamente pelo Auth.
-- Impede INSERT direto na tabela, inclusive com uma sessão autenticada.
revoke insert on public.businesses from anon, authenticated;
revoke insert (owner_id,name,description,category,city,state,website) on public.businesses from authenticated;
drop policy if exists "Confirmed users can submit their own business" on public.businesses;

create or replace function public.register_business_from_auth()
returns trigger language plpgsql security definer set search_path = '' as $$
declare draft jsonb;
begin
 draft := new.raw_user_meta_data -> 'business_draft';
 if draft is null or jsonb_typeof(draft) <> 'object' or draft->>'consent' is distinct from 'on' then return new; end if;
 -- Apenas campos do formulário; proprietário e status vêm do servidor do Auth.
 begin
  insert into public.businesses(owner_id,name,description,category,city,state,website)
  values(new.id,btrim(draft->>'name'),btrim(draft->>'description'),draft->>'category',btrim(draft->>'city'),draft->>'state',coalesce(draft->>'website',''))
  on conflict (owner_id) do nothing;
 exception when check_violation or not_null_violation then
  -- Metadados adulterados não criam empresas nem impedem a criação da conta.
  return new;
 end;
 return new;
end;
$$;
revoke all on function public.register_business_from_auth() from public,anon,authenticated;
drop trigger if exists register_business_from_auth on auth.users;
create trigger register_business_from_auth
 after insert or update of email_confirmed_at, raw_user_meta_data on auth.users
 for each row execute function public.register_business_from_auth();

-- Recupera rascunhos válidos de contas já existentes durante a transição.
update auth.users set raw_user_meta_data = raw_user_meta_data
where raw_user_meta_data ? 'business_draft';
