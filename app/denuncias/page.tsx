import { Arrow } from "@/components/icons";
export const metadata = {
  title: "Orientação e denúncias trabalhistas — Feito em Rede",
  description:
    "Canais oficiais e orientações para situações de discriminação e violação de direitos no trabalho.",
};
export default function Reports() {
  return (
    <main className="form-page wide">
      <div className="eyebrow">
        SOLIDARIEDADE TAMBÉM É CONHECER SEUS DIREITOS
      </div>
      <h1>
        SEU TRABALHO.
        <br />
        SEUS DIREITOS.
      </h1>
      <p>
        Demissão, ameaça ou constrangimento por convicção política pode
        caracterizar discriminação no trabalho. Os fatos e as medidas cabíveis
        precisam ser avaliados pelos órgãos competentes. Você não precisa expor
        sua posição política ou seu relato nesta plataforma para buscar ajuda.
      </p>
      <section className="notice">
        <h2>Ministério Público do Trabalho — MPT</h2>
        <p>
          Canal para comunicar possíveis violações de direitos trabalhistas,
          como discriminação e assédio. Selecione a unidade da região do
          ocorrido e confira as orientações e as opções de sigilo do formulário
          oficial.
        </p>
        <a
          className="button"
          href="https://mpt.mp.br/pgt/servicos/servico-denuncie"
          target="_blank"
          rel="noopener noreferrer"
        >
          Acessar canais do MPT <Arrow />
        </a>
        <p className="muted">
          O MPT atua na proteção de direitos e interesses coletivos. Uma
          denúncia não substitui a análise de uma eventual ação individual.
        </p>
      </section>
      <section className="notice">
        <h2>Ministério do Trabalho e Emprego — MTE</h2>
        <p>
          O serviço oficial de denúncia trabalhista permite comunicar
          irregularidades para avaliação da inspeção do trabalho. Consulte os
          requisitos de identificação, acesso por conta gov.br e tratamento de
          sigilo no serviço.
        </p>
        <a
          className="button"
          href="https://www.gov.br/pt-br/servicos/realizar-denuncia-trabalhista"
          target="_blank"
          rel="noopener noreferrer"
        >
          Acessar denúncia trabalhista no gov.br <Arrow />
        </a>
        <p className="muted">
          Para informações e orientação sobre serviços do trabalho:{" "}
          <a className="text-link" href="tel:158">
            Alô Trabalho · 158
          </a>
          .
        </p>
      </section>
      <section className="talent-bio">
        <h2>Orientação para o seu caso</h2>
        <p>
          Procure o sindicato da sua categoria ou assistência jurídica
          trabalhista para avaliar direitos, provas, prazos e eventual ação na
          Justiça do Trabalho. As medidas dependem da situação concreta; estes
          canais não garantem automaticamente indenização ou reintegração.
        </p>
        <h2>Organize o que aconteceu</h2>
        <ul className="support-list">
          <li>
            Anote datas, contexto e pessoas envolvidas, sem divulgar o relato
            publicamente.
          </li>
          <li>
            Guarde o comunicado de demissão, documentos do vínculo e mensagens
            que já estejam legitimamente em seu poder.
          </li>
          <li>
            Preserve os arquivos originais e evite alterações nas evidências.
          </li>
          <li>
            Não acesse contas, dispositivos ou sistemas de terceiros sem
            autorização.
          </li>
          <li>
            Envie documentos e dados pessoais apenas ao canal oficial ou ao
            profissional que atender seu caso.
          </li>
        </ul>
      </section>
      <p className="notice">
        As denúncias são encaminhadas por você diretamente aos órgãos oficiais.
        O Feito em Rede não recebe, publica nem armazena relatos ou documentos
        de denúncias. Esta página oferece informação geral e não substitui
        orientação jurídica.
      </p>
    </main>
  );
}
