import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const owner = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const draft = {
  name: "Coletivo café",
  description: "Café artesanal feito por pessoas da comunidade.",
  category: "Alimentação",
  city: "Recife",
  state: "PE",
  website: "",
  consent: "on",
  status: "approved",
  owner_id: other,
};
test("new signup registers the business through Auth while blocking direct table inserts", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}'); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.user_id',true),'')::uuid $$; grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`,
    );
    await db.exec(
      await readFile("supabase/migrations/202610280001_businesses.sql", "utf8"),
    );
    await db.exec(
      await readFile(
        "supabase/migrations/202610280002_signup_business.sql",
        "utf8",
      ),
    );
    await db.query(
      "insert into auth.users(id,raw_user_meta_data) values ($1,$2)",
      [owner, JSON.stringify({ business_draft: draft })],
    );
    const result = await db.query<{
      owner_id: string;
      status: string;
      name: string;
    }>("select owner_id,status,name from public.businesses");
    assert.equal(result.rows.length, 1);
    assert.equal(result.rows[0].owner_id, owner);
    assert.equal(result.rows[0].status, "pending");
    // An Auth profile update cannot change an existing business or its moderation status.
    await db.query("update auth.users set raw_user_meta_data=$1 where id=$2", [
      JSON.stringify({ business_draft: { ...draft, name: "Nome adulterado" } }),
      owner,
    ]);
    assert.equal(
      (await db.query<{ name: string }>("select name from public.businesses"))
        .rows[0].name,
      draft.name,
    );
    // Malformed API metadata creates no business and does not break the Auth account.
    await db.query(
      "insert into auth.users(id,raw_user_meta_data) values ($1,$2)",
      [
        other,
        JSON.stringify({ business_draft: { ...draft, category: "inválida" } }),
      ],
    );
    assert.equal((await db.query("select * from auth.users")).rows.length, 2);
    assert.equal(
      (await db.query("select * from public.businesses")).rows.length,
      1,
    );
    await db.exec(
      `set role authenticated;select set_config('app.user_id','${other}',false);`,
    );
    await assert.rejects(
      db.query(
        "insert into public.businesses(owner_id,name,description,category,city,state) values ($1,$2,$3,$4,$5,$6)",
        [
          other,
          draft.name,
          draft.description,
          draft.category,
          draft.city,
          draft.state,
        ],
      ),
    );
    assert.equal(
      (await db.query("select * from public.businesses")).rows.length,
      0,
    );
    await db.exec("reset role;set role anon;");
    assert.equal(
      (await db.query("select * from public.businesses")).rows.length,
      0,
    );
    await db.exec(
      `reset role;set role authenticated;select set_config('app.user_id','${owner}',false);`,
    );
    assert.equal(
      (await db.query("select * from public.businesses")).rows.length,
      1,
    );

    await db.exec("reset role");
    // Seed a rejected business: enabling autoapproval must not publish it.
    await db.query("update auth.users set raw_user_meta_data=$1 where id=$2", [
      JSON.stringify({ business_draft: draft }),
      other,
    ]);
    await db.query(
      "update public.businesses set status='rejected' where owner_id=$1",
      [other],
    );
    await db.exec(
      await readFile(
        "supabase/migrations/202610280003_discovery_autoapproval.sql",
        "utf8",
      ),
    );
    const statuses = await db.query<{ owner_id: string; status: string }>(
      "select owner_id,status from public.businesses",
    );
    assert.equal(
      statuses.rows.find((r) => r.owner_id === owner)?.status,
      "approved",
    );
    assert.equal(
      statuses.rows.find((r) => r.owner_id === other)?.status,
      "rejected",
    );
    const fresh = "33333333-3333-4333-8333-333333333333";
    const contacts = {
      ...draft,
      category: "Beleza e estética",
      phone: "+558133334444",
      whatsapp: "+5581999998888",
      contact_email: "contato@example.com",
      instagram: "coletivo",
    };
    await db.query(
      "insert into auth.users(id,raw_user_meta_data) values ($1,$2)",
      [fresh, JSON.stringify({ business_draft: contacts })],
    );
    const published = await db.query<{
      status: string;
      phone: string;
      category: string;
    }>(
      "select status,phone,category from public.businesses where owner_id=$1",
      [fresh],
    );
    assert.equal(published.rows[0].status, "approved");
    assert.equal(published.rows[0].phone, contacts.phone);
    assert.equal(published.rows[0].category, contacts.category);
    await db.query("update auth.users set raw_user_meta_data=$1 where id=$2", [
      JSON.stringify({
        business_draft: { ...contacts, phone: "+558122223333" },
      }),
      fresh,
    ]);
    assert.equal(
      (
        await db.query<{ phone: string }>(
          "select phone from public.businesses where owner_id=$1",
          [fresh],
        )
      ).rows[0].phone,
      "+558122223333",
    );
    await db.query("update auth.users set raw_user_meta_data=$1 where id=$2", [
      JSON.stringify({ business_draft: contacts }),
      other,
    ]);
    assert.equal(
      (
        await db.query<{ status: string }>(
          "select status from public.businesses where owner_id=$1",
          [other],
        )
      ).rows[0].status,
      "rejected",
    );
    await db.exec("set role anon");
    assert.equal(
      (await db.query("select * from public.businesses")).rows.length,
      2,
    );

    await db.exec(
      `reset role;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated;grant select,insert,delete on storage.objects to authenticated;create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name,'/') $$;`,
    );
    await db.exec(
      await readFile(
        "supabase/migrations/202610280004_business_images.sql",
        "utf8",
      ),
    );
    const ownImage = fresh + "/logo-44444444-4444-4444-8444-444444444444.webp";
    const othersImage =
      owner + "/logo-55555555-5555-4555-8555-555555555555.webp";
    await db.query(
      "insert into storage.objects(bucket_id,name) values ($1,$2)",
      ["business-images", othersImage],
    );
    await db.query("update auth.users set raw_user_meta_data=$1 where id=$2", [
      JSON.stringify({ business_draft: { ...contacts, logo_path: ownImage } }),
      fresh,
    ]);
    assert.equal(
      (
        await db.query<{ logo_path: string }>(
          "select logo_path from public.businesses where owner_id=$1",
          [fresh],
        )
      ).rows[0].logo_path,
      ownImage,
    );
    await db.query("update auth.users set raw_user_meta_data=$1 where id=$2", [
      JSON.stringify({
        business_draft: { ...contacts, logo_path: othersImage },
      }),
      fresh,
    ]);
    assert.equal(
      (
        await db.query<{ logo_path: string }>(
          "select logo_path from public.businesses where owner_id=$1",
          [fresh],
        )
      ).rows[0].logo_path,
      ownImage,
    );
    await db.exec(
      `set role authenticated;select set_config('app.user_id','${fresh}',false);`,
    );
    await db.query(
      "insert into storage.objects(bucket_id,name) values ($1,$2)",
      ["business-images", ownImage],
    );
    await assert.rejects(
      db.query("insert into storage.objects(bucket_id,name) values ($1,$2)", [
        "business-images",
        othersImage,
      ]),
    );
    await assert.rejects(
      db.query("insert into storage.objects(bucket_id,name) values ($1,$2)", [
        "business-images",
        fresh + "/unsafe.svg",
      ]),
    );
    await db.query("delete from storage.objects where name=$1", [othersImage]);
    await db.exec("reset role");
    assert.equal(
      (
        await db.query("select * from storage.objects where name=$1", [
          othersImage,
        ])
      ).rows.length,
      1,
    );
  } finally {
    await db.close();
  }
});
