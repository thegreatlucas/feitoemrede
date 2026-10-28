import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const alice = "11111111-1111-4111-8111-111111111111";
const bob = "22222222-2222-4222-8222-222222222222";
const unconfirmed = "33333333-3333-4333-8333-333333333333";
test("migration enforces ownership, moderation, consent timestamp, and public visibility", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key,email_confirmed_at timestamptz); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.user_id',true),'')::uuid $$; grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated; insert into auth.users values ('${alice}',now()),('${bob}',now()),('${unconfirmed}',null);`,
    );
    await db.exec(
      await readFile("supabase/migrations/202610280001_businesses.sql", "utf8"),
    );
    const identity = async (role: string, id = "") => {
      await db.exec(
        `reset role; set role ${role}; select set_config('app.user_id','${id}',false);`,
      );
    };
    const insert = (owner: string, extra = "") =>
      db.exec(
        `insert into public.businesses(owner_id,name,description,category,city,state${extra ? ",status" : ""}) values ('${owner}','Café coletivo','Café e bolos da comunidade local.','Alimentação','Recife','PE'${extra ? ",'approved'" : ""});`,
      );
    await identity("anon");
    await assert.rejects(insert(alice));
    await identity("authenticated", unconfirmed);
    await assert.rejects(insert(unconfirmed));
    await identity("authenticated", alice);
    await assert.rejects(insert(bob));
    await assert.rejects(insert(alice, "approved"));
    await insert(alice);
    const own = await db.query<{ status: string; consent_at: string }>(
      "select status,consent_at from public.businesses",
    );
    assert.equal(own.rows[0].status, "pending");
    assert.ok(own.rows[0].consent_at);
    await assert.rejects(insert(alice));
    await assert.rejects(
      db.exec("update public.businesses set status='approved'"),
    );
    await identity("anon");
    assert.equal(
      (await db.query("select * from public.businesses")).rows.length,
      0,
    );
    await identity("authenticated", bob);
    assert.equal(
      (await db.query("select * from public.businesses")).rows.length,
      0,
    );
    await db.exec("delete from public.businesses");
    await identity("authenticated", alice);
    assert.equal(
      (await db.query("select * from public.businesses")).rows.length,
      1,
    );
    await db.exec("reset role; update public.businesses set status='approved'");
    await identity("anon");
    assert.equal(
      (await db.query("select * from public.businesses")).rows.length,
      1,
    );
    await identity("authenticated", alice);
    await db.exec("delete from public.businesses");
    assert.equal(
      (await db.query("select * from public.businesses")).rows.length,
      0,
    );
  } finally {
    await db.close();
  }
});
