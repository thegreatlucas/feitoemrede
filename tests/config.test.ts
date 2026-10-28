import { test } from "node:test";
import assert from "node:assert/strict";
import { publicSupabaseKey } from "../lib/supabase/config";
test("uses configured anon key ahead of an obsolete publishable key", () =>
  assert.equal(
    publicSupabaseKey({
      NEXT_PUBLIC_ANON: " anon ",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "obsolete",
    }),
    "anon",
  ));
test("supports standard anon and publishable variable names", () => {
  assert.equal(
    publicSupabaseKey({ NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" }),
    "anon",
  );
  assert.equal(
    publicSupabaseKey({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable" }),
    "publishable",
  );
});
test("ignores empty values and never selects the administrative variable", () => {
  assert.equal(
    publicSupabaseKey({
      NEXT_PUBLIC_ANON: " ",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public",
    }),
    "public",
  );
  assert.equal(
    publicSupabaseKey({ NEXT_SECRET_SERVICE_ROLE: "administrative" }),
    "",
  );
});
