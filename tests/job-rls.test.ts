import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const alice = "11111111-1111-4111-8111-111111111111",
  bob = "22222222-2222-4222-8222-222222222222",
  charlie = "33333333-3333-4333-8333-333333333333";
const companyA = "44444444-4444-4444-8444-444444444444",
  companyB = "55555555-5555-4555-8555-555555555555",
  companyC = "66666666-6666-4666-8666-666666666666";
test("only registered company owners can post; drafts, closed, expired and rejected-company jobs are not public", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${alice}'),('${bob}'),('${charlie}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('app.user_id',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create table public.businesses(id uuid primary key,owner_id uuid,status text);insert into public.businesses values('${companyA}','${alice}','approved'),('${companyB}','${bob}','approved'),('${companyC}','${charlie}','rejected');grant select on public.businesses to anon,authenticated;`,
    );
    await db.exec(
      await readFile("supabase/migrations/202610280006_job_posts.sql", "utf8"),
    );
    const identity = async (role: string, id = "") =>
      db.exec(
        `reset role;set role ${role};select set_config('app.user_id','${id}',false);`,
      );
    const insert = (
      owner: string,
      company: string,
      active = true,
      date = "2099-12-31",
    ) =>
      db.query<{ id: string }>(
        `insert into public.job_posts(owner_id,business_id,title,description,area,city,state,work_mode,contract_type,application_email,expires_on,is_active) values($1,$2,'Vaga de teste','Trabalho com desenvolvimento de aplicações para clientes.','Tecnologia','Recife','PE','Remoto','CLT','vagas@example.com',$3,$4) returning id`,
        [owner, company, date, active],
      );
    await identity("anon");
    await assert.rejects(insert(alice, companyA));
    await identity("authenticated", alice);
    await assert.rejects(insert(alice, companyB));
    await assert.rejects(insert(bob, companyB));
    const own = (await insert(alice, companyA)).rows[0].id;
    await insert(alice, companyA, false);
    await insert(alice, companyA, true, "2000-01-01");
    await identity("anon");
    assert.equal(
      (await db.query("select * from public.job_posts")).rows.length,
      1,
    );
    await identity("authenticated", bob);
    await db.query(
      "update public.job_posts set title='Adulterado' where id=$1",
      [own],
    );
    await assert.rejects(
      db.query("update public.job_posts set business_id=$1 where id=$2", [
        companyB,
        own,
      ]),
    );
    await identity("authenticated", charlie);
    await assert.rejects(insert(charlie, companyC));
    await identity("authenticated", alice);
    assert.equal(
      (
        await db.query<{ title: string }>(
          "select title from public.job_posts where id=$1",
          [own],
        )
      ).rows[0].title,
      "Vaga de teste",
    );
    assert.equal(
      (await db.query("select * from public.job_posts")).rows.length,
      3,
    );
    await db.query("update public.job_posts set is_active=false where id=$1", [
      own,
    ]);
    await identity("anon");
    assert.equal(
      (await db.query("select * from public.job_posts")).rows.length,
      0,
    );
    await db.exec(
      `reset role;update public.businesses set status='rejected' where id='${companyA}';`,
    );
    await identity("authenticated", alice);
    await assert.rejects(
      db.query("update public.job_posts set is_active=true where id=$1", [own]),
    );
    await db.exec(
      `reset role;delete from public.businesses where id='${companyA}'`,
    );
    assert.equal(
      (await db.query("select * from public.job_posts")).rows.length,
      0,
    );
  } finally {
    await db.close();
  }
});
