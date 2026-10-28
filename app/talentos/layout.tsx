import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Banco de talentos — Feito em Rede",
  robots: { index: false, follow: false },
};
export default function TalentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-clarity-mask="true">{children}</div>;
}
