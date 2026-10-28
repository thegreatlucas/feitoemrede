import sharp from "sharp";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
export const IMAGE_BUCKET = "business-images";
export type ImagePaths = { logo_path: string; facade_path: string };
type PreparedImage = { kind: "logo" | "facade"; buffer: Buffer };
export async function prepareImages(form: FormData): Promise<PreparedImage[]> {
  const prepared: PreparedImage[] = [];
  for (const kind of ["logo", "facade"] as const) {
    const file = form.get(kind);
    if (!file || typeof file === "string" || file.size === 0) continue;
    if (file.size > 1_500_000) throw Error("Cada imagem deve ter até 1,5 MB.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      throw Error("Use imagens JPG, PNG ou WebP.");
    try {
      const bytes = Buffer.from(await file.arrayBuffer());
      const image = sharp(bytes, { limitInputPixels: 16_000_000 });
      const metadata = await image.metadata();
      if (
        !["jpeg", "png", "webp"].includes(metadata.format ?? "") ||
        (metadata.pages ?? 1) > 1
      )
        throw Error("Formato inválido");
      const buffer = await image
        .rotate()
        .resize({
          width: kind === "logo" ? 512 : 1400,
          height: kind === "logo" ? 512 : 1000,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer();
      if (buffer.length > 1_500_000) throw Error("Imagem muito grande");
      prepared.push({ kind, buffer });
    } catch {
      throw Error(
        "Não foi possível ler a imagem. Use um JPG, PNG ou WebP válido com até 16 megapixels.",
      );
    }
  }
  return prepared;
}
export async function uploadImages(
  db: SupabaseClient,
  userId: string,
  files: PreparedImage[],
  previous: Partial<ImagePaths>,
  form: FormData,
) {
  const paths: ImagePaths = {
    logo_path: previous.logo_path ?? "",
    facade_path: previous.facade_path ?? "",
  };
  const uploaded: string[] = [];
  try {
    for (const kind of ["logo", "facade"] as const)
      if (form.get("remove_" + kind) === "on") paths[`${kind}_path`] = "";
    for (const file of files) {
      const path = `${userId}/${file.kind}-${randomUUID()}.webp`;
      const { error } = await db.storage
        .from(IMAGE_BUCKET)
        .upload(path, file.buffer, {
          contentType: "image/webp",
          upsert: false,
          cacheControl: "3600",
        });
      if (error)
        throw Error(
          "Não foi possível enviar as fotos. Tente novamente em instantes.",
        );
      uploaded.push(path);
      paths[`${file.kind}_path`] = path;
    }
  } catch (error) {
    if (uploaded.length) await db.storage.from(IMAGE_BUCKET).remove(uploaded);
    throw error;
  }
  const obsolete = Object.values(previous).filter(
    (p): p is string =>
      typeof p === "string" &&
      p.startsWith(userId + "/") &&
      !Object.values(paths).includes(p),
  );
  return { paths, obsolete };
}
export async function removeImages(db: SupabaseClient, paths: string[]) {
  if (!paths.length) return;
  const { error } = await db.storage.from(IMAGE_BUCKET).remove(paths);
  if (error)
    throw Error("Não foi possível remover as imagens. Tente novamente.");
}
