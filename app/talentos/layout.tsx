import { pageMetadata } from "@/lib/metadata";
export default function TalentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-clarity-mask="true">{children}</div>;
}

export const metadata = pageMetadata(
  "Banco de talentos",
  "Conecte profissionais e oportunidades. Perfis e currículos disponíveis somente após login.",
  "/talentos",
  true,
);
