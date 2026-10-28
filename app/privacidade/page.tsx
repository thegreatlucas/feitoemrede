import { pageMetadata } from "@/lib/metadata";
export default function Privacidade() {
  return (
    <main className="form-page">
      <div className="eyebrow">CONFIANÇA É COLETIVA</div>
      <h1>
        UMA REDE
        <br />
        COM RESPEITO.
      </h1>
      <h2>Participação</h2>
      <p>
        A rede é aberta a empreendedores que compartilham valores de
        solidariedade, diversidade e respeito. Não solicitamos filiação
        partidária nem registramos posicionamento político. Não são aceitos
        cadastros falsos, discriminação, atividades ilegais ou uso de dados de
        terceiros sem autorização.
      </p>
      <h2>Seus dados</h2>
      <p>
        O e-mail de acesso é usado para autenticação. Nome, descrição,
        categoria, cidade, UF, site e os contatos comerciais que você informar
        (WhatsApp, telefone, e-mail comercial e Instagram) ficam públicos assim
        que o cadastro for concluído. Não inclua endereço residencial,
        documentos ou dados sensíveis. O Supabase armazena os dados e gerencia a
        autenticação; a Vercel hospeda a aplicação quando publicada.
      </p>
      <p>
        Logos e fotos da fachada enviados também ficam públicos. Processamos as
        imagens para reduzir seu tamanho e remover metadados, incluindo a
        localização da câmera. Envie apenas arquivos que você tem direito de
        usar.
      </p>
      <h2>Banco de talentos</h2>
      <p>
        Perfis profissionais, contatos e currículos não são públicos. Somente
        pessoas autenticadas podem consultar perfis ativos e baixar seus
        currículos. Isso inclui qualquer pessoa que crie uma conta na
        plataforma. Use os dados exclusivamente para oportunidades de trabalho,
        sem discriminação, coleta em massa ou mensagens não solicitadas.
      </p>
      <p>
        Você pode editar, ocultar ou excluir seu perfil e currículo em Meu
        perfil profissional. O currículo fica em armazenamento privado, e cada
        download exige uma sessão válida. Não pedimos posição política, filiação
        partidária ou motivo da perda do emprego. Evite incluir CPF, endereço
        residencial completo, dados de saúde ou outras informações sensíveis no
        perfil ou no PDF.
      </p>
      <h2>Controle e moderação</h2>
      <p>
        Você pode editar os dados e contatos ou remover o negócio pelo painel. A
        publicação é automática; a moderação pode retirar cadastros que violem
        as regras. Antes da abertura pública, o responsável pela plataforma deve
        disponibilizar um canal de contato para denúncias e solicitações de
        acesso, correção e exclusão da conta e dos dados pessoais.
      </p>
      <h2>Vagas e canais de denúncia</h2>
      <p>
        As vagas e os contatos de candidatura informados pelas empresas são
        públicos. As candidaturas ocorrem diretamente pelo canal escolhido pela
        empresa; o currículo do banco de talentos não é enviado automaticamente.
        Requisitos discriminatórios e cobranças para concorrer não são
        permitidos.
      </p>
      <p>
        A página de orientação trabalhista contém links para canais oficiais
        externos. Não recebemos nem armazenamos relatos, documentos de denúncia
        ou informações sobre a opinião política de trabalhadores.
      </p>
      <h2>Cookies</h2>
      <p>
        Utilizamos cookies de sessão para manter seu acesso e o Microsoft
        Clarity para analisar a navegação e melhorar a experiência, incluindo
        mapas de calor e gravações de sessão. O serviço pode utilizar cookies e
        processar dados de interação com o site.
      </p>
    </main>
  );
}

export const metadata = pageMetadata(
  "Privacidade e participação",
  "Saiba como seus dados são tratados e conheça as regras de participação.",
  "/privacidade",
  false,
);
