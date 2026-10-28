import { pageMetadata } from "@/lib/metadata";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { safeReturnTo } from "@/lib/talent-schema";
import { AccountForm } from "@/components/account-form";
export default async function CreateAccount({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const p = await searchParams;
  const next = safeReturnTo(p.next ?? "/talentos/meu-perfil");
  if (await currentUser()) redirect(next);
  return (
    <main className="form-page" data-clarity-mask="true">
      <div className="eyebrow">SUA EXPERIÊNCIA IMPORTA</div>
      <h1>
        ENTRE PARA
        <br />A REDE.
      </h1>
      <p>
        Crie um acesso para cadastrar seu talento ou encontrar profissionais.
        Você não precisa ter uma empresa.
      </p>
      <AccountForm next={next} />
    </main>
  );
}

export const metadata = pageMetadata(
  "Criar acesso",
  "Crie sua conta e participe da rede de talentos e oportunidades.",
  "/criar-conta",
  true,
);
