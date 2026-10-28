import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const alice = "11111111-1111-4111-8111-111111111111";
const bob = "22222222-2222-4222-8222-222222222222";
const aliceCv = alice + "/cv-33333333-3333-4333-8333-333333333333.pdf";
const bobCv = bob + "/cv-44444444-4444-4444-8444-444444444444.pdf";
test("talent identities and CVs are private to authenticated users, with owner-only editing and hidden profiles", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${alice}'),('${bob}');create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.user_id',true),'')::uuid $$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to anon,authenticated;grant select on storage.objects to anon,authenticated;grant insert,delete on storage.objects to authenticated;create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name,'/') $$;`,
    );
    await db.exec(
      await readFile(
        "supabase/migrations/202610280005_talent_bank.sql",
        "utf8",
      ),
    );
    const identity = async (role: string, id = "") =>
      db.exec(
        `reset role;set role ${role};select set_config('app.user_id','${id}',false);`,
      );
    const insert = (id: string, path: string, active: boolean) =>
      db.query(
        `insert into public.talent_profiles(owner_id,full_name,headline,summary,area,city,state,work_modes,contact_email,resume_path,is_active) values($1,'Pessoa teste','Profissional de tecnologia','Experiência com desenvolvimento de aplicações.','Tecnologia','Recife','PE',array['Remoto'],'pessoa@example.com',$2,$3)`,
        [id, path, active],
      );
    await identity("anon");
    await assert.rejects(db.query("select * from public.talent_profiles"));
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      0,
    );
    await identity("authenticated", alice);
    await insert(alice, aliceCv, true);
    await assert.rejects(insert(bob, bobCv, true));
    await db.query(
      "insert into storage.objects(bucket_id,name) values($1,$2)",
      ["talent-cvs", aliceCv],
    );
    await assert.rejects(
      db.query("insert into storage.objects(bucket_id,name) values($1,$2)", [
        "talent-cvs",
        bobCv,
      ]),
    );
    await identity("authenticated", bob);
    await insert(bob, bobCv, false);
    await db.query(
      "insert into storage.objects(bucket_id,name) values($1,$2)",
      ["talent-cvs", bobCv],
    );
    assert.equal(
      (await db.query("select * from public.talent_profiles")).rows.length,
      2,
    );
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      2,
    );
    await db.query(
      "update public.talent_profiles set full_name='Tentativa' where owner_id=$1",
      [alice],
    );
    await assert.rejects(
      db.query(
        "update public.talent_profiles set owner_id=$1 where owner_id=$2",
        [alice, bob],
      ),
    );
    await db.query("delete from storage.objects where name=$1", [aliceCv]);
    await identity("authenticated", alice);
    assert.equal(
      (await db.query("select * from public.talent_profiles")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      1,
    );
    assert.equal(
      (
        await db.query<{ full_name: string }>(
          "select full_name from public.talent_profiles where owner_id=$1",
          [alice],
        )
      ).rows[0].full_name,
      "Pessoa teste",
    );
    await db.query(
      "update public.talent_profiles set is_active=false where owner_id=$1",
      [alice],
    );
    await identity("authenticated", bob);
    assert.equal(
      (await db.query("select * from public.talent_profiles")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      1,
    );
    await identity("anon");
    await assert.rejects(
      db.query("select full_name,contact_email from public.talent_profiles"),
    );
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      0,
    );
    await db.exec("reset role");
    assert.equal(
      (
        await db.query<{ public: boolean }>(
          "select public from storage.buckets where id='talent-cvs'",
        )
      ).rows[0].public,
      false,
    );
  } finally {
    await db.close();
  }
});
