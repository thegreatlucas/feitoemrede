import type { Metadata } from "next";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ||
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || "feitoemrede.vercel.app"}`,
);

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  privatePage = false,
): Metadata {
  const fullTitle = title.includes("Feito em Rede")
    ? title
    : `${title} — Feito em Rede`;
  const image = {
    url: `/og?title=${encodeURIComponent(title)}`,
    width: 1200,
    height: 630,
    alt: `${title} — Feito em Rede`,
  };
  return {
    title: fullTitle,
    description,
    ...(!privatePage && { alternates: { canonical: path } }),
    ...(privatePage && { robots: { index: false, follow: false } }),
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "Feito em Rede",
      title: fullTitle,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
