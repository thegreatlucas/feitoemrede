import Link from "next/link";
import { categories } from "@/lib/schema";
export type BusinessDefaults = Partial<
  Record<
    "name" | "description" | "category" | "city" | "state" | "website" | "consent",
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
      <label className="checkbox">
        <input type="checkbox" name="consent" required defaultChecked={defaults.consent === "on"} />
        <span>
          Autorizo a publicação dos dados deste negócio após análise e concordo
          com os <Link href="/privacidade">termos de participação</Link>.
          Declaro compromisso com uma rede solidária e respeitosa.
        </span>
      </label>
    </>
  );
}
