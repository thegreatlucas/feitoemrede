"use client";
import { businessImageUrl } from "@/lib/image-url";
import Link from "next/link";
import { categories } from "@/lib/schema";
export type BusinessDefaults = Partial<
  Record<
    | "name"
    | "description"
    | "category"
    | "city"
    | "state"
    | "website"
    | "consent"
    | "phone"
    | "whatsapp"
    | "contact_email"
    | "instagram"
    | "logo_path"
    | "facade_path",
    string
  >
>;
export function BusinessFields({
  defaults = {},
}: {
  defaults?: BusinessDefaults;
}) {
  return (
    <>
      <label>
        Nome do negócio
        <input
          name="name"
          required
          minLength={3}
          maxLength={100}
          defaultValue={defaults.name}
          autoComplete="organization"
        />
      </label>
      <label>
        O que você faz?
        <textarea
          name="description"
          required
          minLength={20}
          maxLength={1000}
          rows={5}
          defaultValue={defaults.description}
          placeholder="Conte sua história e apresente seus produtos ou serviços."
        />
      </label>
      <div className="form-row">
        <label>
          Categoria
          <select name="category" defaultValue={defaults.category}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Cidade
          <input
            name="city"
            required
            minLength={2}
            maxLength={80}
            defaultValue={defaults.city}
            autoComplete="address-level2"
          />
        </label>
        <label>
          UF
          <select required name="state" defaultValue={defaults.state ?? ""}>
            <option value="" disabled>
              Selecione
            </option>
            {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
              .split(" ")
              .map((s) => (
                <option key={s}>{s}</option>
              ))}
          </select>
        </label>
      </div>
      <label>
        Site ou rede social <small>(opcional, endereço HTTPS)</small>
        <input
          type="url"
          name="website"
          placeholder="https://"
          maxLength={300}
          defaultValue={defaults.website}
        />
      </label>
      <div className="contact-section">
        <h2>Como os clientes encontram você?</h2>
        <p className="muted">
          Preencha apenas os contatos que deseja tornar públicos. O e-mail
          abaixo pode ser diferente do usado para entrar.
        </p>
        <div className="form-row">
          <label>
            WhatsApp comercial
            <input
              type="tel"
              name="whatsapp"
              maxLength={30}
              defaultValue={defaults.whatsapp}
              placeholder="(81) 99999-9999"
            />
          </label>
          <label>
            Telefone comercial
            <input
              type="tel"
              name="phone"
              maxLength={30}
              defaultValue={defaults.phone}
              placeholder="(81) 3333-3333"
            />
          </label>
        </div>
        <label>
          E-mail comercial público
          <input
            type="email"
            name="contact_email"
            maxLength={254}
            defaultValue={defaults.contact_email}
            placeholder="contato@seunegocio.com.br"
          />
        </label>
        <label>
          Instagram <small>(usuário, sem o endereço do site)</small>
          <input
            name="instagram"
            maxLength={31}
            defaultValue={defaults.instagram}
            placeholder="@seunegocio"
          />
        </label>
      </div>
      <div className="contact-section">
        <h2>Mostre a cara do seu negócio</h2>
        <p className="muted">
          Logo e foto da fachada são opcionais e ficam públicos. JPG, PNG ou
          WebP, até 1,5 MB por imagem. Envie apenas imagens que você tem direito
          de usar.
        </p>
        <div className="form-row">
          {(["logo", "facade"] as const).map((kind) => (
            <div className="image-field" key={kind}>
              <label>
                {kind === "logo" ? "Logo do negócio" : "Foto da fachada"}
                <input
                  type="file"
                  name={kind}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    event.currentTarget.setCustomValidity(
                      file && file.size > 1500000
                        ? "Escolha uma imagem de até 1,5 MB."
                        : file &&
                            !["image/jpeg", "image/png", "image/webp"].includes(
                              file.type,
                            )
                          ? "Use um JPG, PNG ou WebP."
                          : "",
                    );
                    event.currentTarget.reportValidity();
                  }}
                />
              </label>
              {businessImageUrl(defaults[`${kind}_path`]) && (
                <>
                  <img
                    src={businessImageUrl(defaults[`${kind}_path`])!}
                    alt={kind === "logo" ? "Logo atual" : "Fachada atual"}
                    className="upload-preview"
                  />
                  <label className="checkbox">
                    <input type="checkbox" name={"remove_" + kind} />
                    <span>
                      Remover {kind === "logo" ? "logo" : "foto da fachada"}
                    </span>
                  </label>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <label className="checkbox">
        <input
          type="checkbox"
          name="consent"
          required
          defaultChecked={defaults.consent === "on"}
        />
        <span>
          Autorizo a publicação dos dados e contatos comerciais deste negócio no
          catálogo e concordo com os{" "}
          <Link href="/privacidade">termos de participação</Link>. Declaro
          compromisso com uma rede solidária e respeitosa.
        </span>
      </label>
    </>
  );
}
