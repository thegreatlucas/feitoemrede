-- Imagens públicas com escrita restrita ao proprietário.
alter table public.businesses
 add column if not exists logo_path text not null default '' check (logo_path='' or (split_part(logo_path,'/',1)=owner_id::text and logo_path ~ '^[0-9a-f-]{36}/logo-[0-9a-f-]{36}\.webp$')),
 add column if not exists facade_path text not null default '' check (facade_path='' or (split_part(facade_path,'/',1)=owner_id::text and facade_path ~ '^[0-9a-f-]{36}/facade-[0-9a-f-]{36}\.webp$'));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('business-images','business-images',true,1500000,array['image/webp'])
on conflict (id) do update set public=true,file_size_limit=1500000,allowed_mime_types=array['image/webp'];
create policy "business_images_select_own" on storage.objects for select to authenticated using (bucket_id='business-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "business_images_insert_own" on storage.objects for insert to authenticated with check (bucket_id='business-images' and (storage.foldername(name))[1]=(select auth.uid())::text and name ~ '^[0-9a-f-]{36}/(logo|facade)-[0-9a-f-]{36}\.webp$');
create policy "business_images_delete_own" on storage.objects for delete to authenticated using (bucket_id='business-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create or replace function public.register_business_from_auth()
returns trigger language plpgsql security definer set search_path = '' as $$
declare draft jsonb;
begin
 draft := new.raw_user_meta_data -> 'business_draft';
 if draft is null or jsonb_typeof(draft) <> 'object' or draft->>'consent' is distinct from 'on' then return new; end if;
 -- Apenas campos do formulário; proprietário e status vêm do servidor do Auth.
 begin
  insert into public.businesses(owner_id,name,description,category,city,state,website,phone,whatsapp,contact_email,instagram,logo_path,facade_path,status)
  values(new.id,btrim(draft->>'name'),btrim(draft->>'description'),draft->>'category',btrim(draft->>'city'),draft->>'state',coalesce(draft->>'website',''),coalesce(draft->>'phone',''),coalesce(draft->>'whatsapp',''),coalesce(draft->>'contact_email',''),coalesce(draft->>'instagram',''),coalesce(draft->>'logo_path',''),coalesce(draft->>'facade_path',''),'approved')
  on conflict (owner_id) do update set
   name=excluded.name, description=excluded.description, category=excluded.category,
   city=excluded.city, state=excluded.state, website=excluded.website,
   phone=excluded.phone, whatsapp=excluded.whatsapp, contact_email=excluded.contact_email, instagram=excluded.instagram,logo_path=excluded.logo_path,facade_path=excluded.facade_path;
 exception when check_violation or not_null_violation then
  -- Metadados adulterados não criam empresas nem impedem a criação da conta.
  return new;
 end;
 return new;
end;
$$;
revoke all on function public.register_business_from_auth() from public,anon,authenticated;

