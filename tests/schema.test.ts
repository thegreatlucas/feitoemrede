import { test } from "node:test";
import assert from "node:assert/strict";
import { businessSchema } from "../lib/schema";
const valid = {
  name: "Café da Comunidade",
  description: "Café artesanal e bolos feitos na nossa comunidade.",
  category: "Alimentação",
  city: "Recife",
  state: "PE",
  website: "https://example.com",
  consent: "on",
};
test("accepts a valid business and trims public fields", () => {
  const result = businessSchema.parse({
    ...valid,
    name: "  Café da Comunidade  ",
  });
  assert.equal(result.name, valid.name);
});
for (const [name, value] of [
  ["website", "javascript:alert(1)"],
  ["website", "http://example.com"],
  ["state", "XX"],
  ["category", "inexistente"],
  ["consent", ""],
  ["description", "curta"],
] as const) {
  test(`rejects invalid ${name}: ${value}`, () =>
    assert.equal(
      businessSchema.safeParse({ ...valid, [name]: value }).success,
      false,
    ));
}
test("allows an omitted public contact", () =>
  assert.equal(
    businessSchema.safeParse({ ...valid, website: "" }).success,
    true,
  ));

test("signup requires valid business data and matching passwords", async () => {
  const { signupSchema } = await import("../lib/schema");
  const signup = {
    ...valid,
    email: "pessoa@example.com",
    password: "senha-longa-123",
    passwordConfirmation: "senha-longa-123",
  };
  assert.equal(signupSchema.safeParse(signup).success, true);
  assert.equal(
    signupSchema.safeParse({ ...signup, passwordConfirmation: "outra-senha" })
      .success,
    false,
  );
  assert.equal(signupSchema.safeParse({ ...signup, name: "" }).success, false);
});

test("normalizes public Brazilian contacts without using the login email", () => {
  const parsed = businessSchema.parse({
    ...valid,
    phone: "(81) 3333-4444",
    whatsapp: "(81) 99999-8888",
    instagram: "@cafecoletivo",
    contact_email: "contato@example.com",
  });
  assert.equal(parsed.phone, "+558133334444");
  assert.equal(parsed.whatsapp, "+5581999998888");
  assert.equal(parsed.instagram, "cafecoletivo");
  assert.equal(
    businessSchema.safeParse({ ...valid, phone: "123" }).success,
    false,
  );
  assert.equal(
    businessSchema.safeParse({
      ...valid,
      instagram: "https://instagram.com/teste",
    }).success,
    false,
  );
});
