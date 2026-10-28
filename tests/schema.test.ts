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
