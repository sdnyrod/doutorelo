import { describe, expect, it } from "vitest";
import {
  type DayanNetworkProfessionalSeed,
  rankDayanNetworkProfessionals,
  resolveDayanNetworkProfessionalLocationFromMessage,
} from "./dayanNetworkProfessionalsSeed";

function professional(overrides: Partial<DayanNetworkProfessionalSeed>): DayanNetworkProfessionalSeed {
  return {
    name: overrides.name ?? "Profissional Teste",
    specialty: overrides.specialty ?? "Medicina integrativa",
    professionalType: overrides.professionalType ?? "doctor",
    bio: overrides.bio ?? "Registro sintético para teste de regra geral.",
    city: overrides.city ?? "Cidade Sintética",
    state: overrides.state ?? "TS",
    addressLine: overrides.addressLine ?? "Rua Teste, 100",
    lat: overrides.lat ?? "-10.0000000",
    lng: overrides.lng ?? "-50.0000000",
    phone: overrides.phone ?? "(00) 0000-0000",
    email: overrides.email ?? "teste@rededayan.example",
    whatsapp: overrides.whatsapp ?? "5500000000000",
    modality: overrides.modality ?? "both",
    active: overrides.active ?? 1,
    photoUrl: overrides.photoUrl ?? null,
    crm: overrides.crm ?? "CRM-TS 00001",
    crn: overrides.crn ?? null,
    crf: overrides.crf ?? null,
  };
}

describe("professional location resolution and ranking invariants", () => {
  it("extrai Cidade-UF arbitrária da mensagem sem depender da base ou de nomes privilegiados", () => {
    const resolved = resolveDayanNetworkProfessionalLocationFromMessage(
      "Preciso de profissionais ligados ao Dayan em Município Alfa-TO.",
      [],
    );

    expect(resolved).toEqual({
      city: "Município Alfa",
      state: "TO",
      source: "message_city_state",
    });
  });

  it("reconhece cidade sem UF somente quando ela existe na base de profissionais recebida", () => {
    const professionals = [
      professional({ name: "Profissional Alfa", city: "Município Beta", state: "ZZ" }),
      professional({ name: "Profissional Gama", city: "Município Gama", state: "ZZ" }),
    ];

    const resolved = resolveDayanNetworkProfessionalLocationFromMessage(
      "Você tem alguém da Rede Dayan no Município Beta?",
      professionals,
    );

    expect(resolved).toEqual({
      city: "Município Beta",
      state: "ZZ",
      source: "professional_base_city",
    });
  });

  it("não escolhe cidade por aproximação quando a mensagem sem UF bate em mais de uma cidade da base", () => {
    const professionals = [
      professional({ name: "Profissional Delta A", city: "Município Delta", state: "AA" }),
      professional({ name: "Profissional Delta B", city: "Município Delta", state: "BB" }),
    ];

    const resolved = resolveDayanNetworkProfessionalLocationFromMessage(
      "Quero profissionais da Rede Dayan no Município Delta.",
      professionals,
    );

    expect(resolved).toBeNull();
  });

  it("quando cidade explícita não existe na base, o ranking retorna vazio em vez de usar outra cidade como fallback principal", () => {
    const professionals = [
      professional({ name: "Profissional Local", city: "Município Existente", state: "AA" }),
      professional({ name: "Profissional Estadual", city: "Município Vizinho", state: "AA" }),
    ];

    const recommendations = rankDayanNetworkProfessionals({
      city: "Município Ausente",
      state: "AA",
      need: "preciso de médico integrativo",
      professionals,
    });

    expect(recommendations).toEqual([]);
  });

  it("quando cidade explícita existe na base, o ranking restringe todos os resultados à cidade e UF solicitadas", () => {
    const professionals = [
      professional({ name: "Profissional Correto", city: "Município Alvo", state: "AA" }),
      professional({ name: "Profissional Outra Cidade", city: "Município Vizinho", state: "AA" }),
      professional({ name: "Profissional Outro Estado", city: "Município Alvo", state: "BB" }),
    ];

    const recommendations = rankDayanNetworkProfessionals({
      city: "Município Alvo",
      state: "AA",
      need: "preciso de médico integrativo",
      professionals,
    });

    expect(recommendations).toHaveLength(1);
    expect(recommendations.every((item) => item.city === "Município Alvo" && item.state === "AA")).toBe(true);
  });
});
