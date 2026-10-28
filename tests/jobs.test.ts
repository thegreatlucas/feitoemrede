import { test } from "node:test";
import assert from "node:assert/strict";
import { jobSchema, brazilToday, defaultJobDeadline } from "../lib/job-schema";
const valid = {
  title: "Analista de tecnologia",
  description:
    "Desenvolvimento e manutenção de aplicações com foco em qualidade.",
  area: "Tecnologia",
  city: "Recife",
  state: "PE",
  work_mode: "Remoto",
  contract_type: "CLT",
  application_email: "vagas@example.com",
  expires_on: "2099-12-31",
  is_active: true,
  consent: "on",
};
test("job requires application channel, fair posting consent and safe links", () => {
  assert.equal(jobSchema.safeParse(valid).success, true);
  assert.equal(
    jobSchema.safeParse({ ...valid, application_email: "" }).success,
    false,
  );
  assert.equal(
    jobSchema.safeParse({ ...valid, application_url: "javascript:alert(1)" })
      .success,
    false,
  );
  assert.equal(jobSchema.safeParse({ ...valid, consent: "" }).success, false);
  assert.equal(
    jobSchema.safeParse({ ...valid, expires_on: "not-a-date" }).success,
    false,
  );
  assert.match(brazilToday(), /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(defaultJobDeadline() > brazilToday());
});
