import { Arrow, Burst } from "@/components/icons";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: "Feito em Rede — Quem faz, fortalece.",
  description:
    "Encontre e fortaleça empreendedores da sua comunidade. Uma economia feita por gente, para gente.",
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          id="microsoft-clarity"
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "z4uj94ud7q");`,
          }}
        />
      </head>
      <body>
        <header>
          <Link href="/" className="brand">
            <span className="brand-icon">
              <Arrow />
            </span>
            <span>
              FEITO<span className="brand-small">EM REDE</span>
            </span>
          </Link>
          <nav>
            <Link href="/#explorar">Explorar negócios</Link>
            <Link href="/painel">Meu negócio</Link>
            <Link href="/cadastro" className="button small">
              Faça parte{" "}
              <span>
                <Arrow />
              </span>
            </Link>
          </nav>
        </header>
        {children}
        <footer>
          <Link href="/" className="footer-brand">
            FEITO EM REDE<span>O futuro é coletivo.</span>
          </Link>
          <p>
            Uma rede independente de pessoas que fazem.
            <br />
            Sem vínculo institucional com partidos políticos.
          </p>
          <Link href="/privacidade">
            Privacidade e participação <Arrow />
          </Link>
        </footer>
      </body>
    </html>
  );
}
