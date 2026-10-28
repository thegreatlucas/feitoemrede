import { test } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { talentSchema, safeReturnTo } from "../lib/talent-schema";
import { prepareCv } from "../lib/talent-cv";
const valid = {
  full_name: "Pessoa de teste",
  headline: "Analista de comunicação",
  summary: "Experiência com comunicação e organização de projetos.",
  area: "Comunicação e marketing",
  city: "Recife",
  state: "PE",
  work_modes: ["Remoto", "Híbrido"],
  contact_email: "pessoa@example.com",
  is_active: true,
  consent: "on",
};
test("talent profile requires work mode and consent and normalizes contact", () => {
  const result = talentSchema.parse({ ...valid, phone: "(81) 99999-8888" });
  assert.equal(result.phone, "+5581999998888");
  assert.equal(
    talentSchema.safeParse({ ...valid, work_modes: [] }).success,
    false,
  );
  assert.equal(
    talentSchema.safeParse({ ...valid, consent: "" }).success,
    false,
  );
  assert.equal(
    talentSchema.safeParse({
      ...valid,
      linkedin: "https://evil.example.com/me",
    }).success,
    false,
  );
});
test("login redirects stay within approved application destinations", () => {
  for (const next of [
    "https://evil.example.com",
    "//evil.example.com",
    "/\\evil.example.com",
    "/talentos?next=evil",
  ])
    assert.equal(safeReturnTo(next), "/painel");
  assert.equal(safeReturnTo("/talentos/meu-perfil"), "/talentos/meu-perfil");
});
test("CV validation accepts real PDFs and rejects impostors and oversized files", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  const bytes = await pdf.save();
  const result = await prepareCv(
    new File([new Uint8Array(bytes)], "cv.pdf", { type: "application/pdf" }),
  );
  assert.ok(result?.length);
  assert.equal(await prepareCv(null), null);
  for (const file of [
    new File(["<html>fake</html>"], "cv.pdf", { type: "application/pdf" }),
    new File(["%PDF- nonsense"], "cv.pdf", { type: "application/pdf" }),
    new File([new Uint8Array(2000001)], "large.pdf", {
      type: "application/pdf",
    }),
  ])
    await assert.rejects(prepareCv(file));
});

test("malformed links return validation errors without throwing", () => {
  assert.equal(
    talentSchema.safeParse({ ...valid, linkedin: "not-a-url" }).success,
    false,
  );
  assert.equal(
    talentSchema.safeParse({ ...valid, portfolio: "not-a-url" }).success,
    false,
  );
});
