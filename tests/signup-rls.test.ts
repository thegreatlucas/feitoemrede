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
  } finally {
    await db.close();
  }
});
