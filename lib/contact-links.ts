export type BusinessContacts = {
  phone?: string | null;
  whatsapp?: string | null;
  contact_email?: string | null;
  instagram?: string | null;
  website?: string | null;
};
export function contactLinks(b: BusinessContacts) {
  const links: { label: string; href: string; external: boolean }[] = [];
  if (b.whatsapp && /^\+55[1-9][0-9]{9,10}$/.test(b.whatsapp))
    links.push({
      label: "WhatsApp",
      href: "https://wa.me/" + b.whatsapp.slice(1),
      external: true,
    });
  if (b.phone && /^\+55[1-9][0-9]{9,10}$/.test(b.phone))
    links.push({ label: "Ligar", href: "tel:" + b.phone, external: false });
  if (b.contact_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.contact_email))
    links.push({
      label: "E-mail",
      href: "mailto:" + encodeURIComponent(b.contact_email),
      external: false,
    });
  if (b.instagram && /^[A-Za-z0-9._]{1,30}$/.test(b.instagram))
    links.push({
      label: "Instagram",
      href: "https://www.instagram.com/" + b.instagram + "/",
      external: true,
    });
  if (b.website?.startsWith("https://"))
    links.push({ label: "Site", href: b.website, external: true });
  return links;
}
