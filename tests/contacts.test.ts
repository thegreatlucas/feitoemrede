import { test } from "node:test";
import assert from "node:assert/strict";
import { contactLinks } from "../lib/contact-links";
test("builds usable public contact links and rejects unsafe values", () => {
  const links = contactLinks({
    phone: "+558133334444",
    whatsapp: "+5581999998888",
    contact_email: "contato@example.com",
    instagram: "coletivo",
    website: "https://example.com",
  });
  assert.equal(links.length, 5);
  assert.equal(links[0].href, "https://wa.me/5581999998888");
  assert.equal(links[1].href, "tel:+558133334444");
  assert.deepEqual(
    contactLinks({
      phone: "javascript:alert(1)",
      instagram: "../bad",
      contact_email: "x\r\nBcc:spam@example.com",
      website: "javascript:alert(1)",
    }),
    [],
  );
});
