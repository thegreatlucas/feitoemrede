import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { prepareImages } from "../lib/business-images";
import { businessImageUrl } from "../lib/image-url";
test("validates and converts uploaded pictures to resized WebP without camera metadata", async () => {
  const input = await sharp({
    create: { width: 1800, height: 1200, channels: 3, background: "red" },
  })
    .jpeg()
    .withMetadata()
    .toBuffer();
  const form = new FormData();
  form.set(
    "logo",
    new File([new Uint8Array(input)], "logo.jpg", { type: "image/jpeg" }),
  );
  const images = await prepareImages(form);
  assert.equal(images.length, 1);
  const result = await sharp(images[0].buffer).metadata();
  assert.equal(result.format, "webp");
  assert.ok((result.width ?? 0) <= 512);
  assert.equal(result.exif, undefined);
});
test("rejects fake images, SVG and files beyond the size limit", async () => {
  for (const file of [
    new File(["not an image"], "fake.png", { type: "image/png" }),
    new File(["<svg/>"], "x.svg", { type: "image/svg+xml" }),
    new File([new Uint8Array(1500001)], "large.jpg", { type: "image/jpeg" }),
  ]) {
    const form = new FormData();
    form.set("facade", file);
    await assert.rejects(prepareImages(form));
  }
  assert.equal(businessImageUrl("https://example.com/untrusted.jpg"), null);
  assert.equal(businessImageUrl("../private/image.webp"), null);
});
