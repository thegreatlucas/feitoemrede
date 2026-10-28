import { PDFDocument } from "pdf-lib";
export async function prepareCv(file: FormDataEntryValue | null) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > 2_000_000) throw Error("O currículo deve ter até 2 MB.");
  if (file.type !== "application/pdf") throw Error("Envie o currículo em PDF.");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0, 5).toString() !== "%PDF-")
    throw Error("O arquivo enviado não é um PDF válido.");
  try {
    const pdf = await PDFDocument.load(bytes, {
      updateMetadata: false,
      throwOnInvalidObject: true,
    });
    if (pdf.getPageCount() < 1 || pdf.getPageCount() > 20)
      throw Error("Número de páginas inválido");
  } catch {
    throw Error("Use um PDF válido, sem senha, com até 20 páginas.");
  }
  return bytes;
}
export type TalentProfile = {
  owner_id: string;
  full_name: string;
  headline: string;
  summary: string;
  area: string;
  city: string;
  state: string;
  region: string;
  work_modes: string[];
  skills: string;
  contact_email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  resume_path: string;
  is_active: boolean;
  updated_at: string;
};
