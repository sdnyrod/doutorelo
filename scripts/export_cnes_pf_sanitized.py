from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
from pathlib import Path
from typing import Any

import pandas as pd
import requests
import pysus

DATASUS_PORTAL_URL = "https://datasus.saude.gov.br/transferencia-de-arquivos/"


def compact(value: Any, max_len: int | None = None) -> str | None:
    if value is None or pd.isna(value):
        return None
    text = re.sub(r"\s+", " ", str(value).strip())
    if not text or text.lower() in {"nan", "none", "null"}:
        return None
    return text[:max_len] if max_len else text


def normalize_key(value: str | None) -> str:
    text = compact(value) or ""
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return text[:120]


def fetch_municipalities(state: str) -> dict[str, str]:
    url = f"https://servicodados.ibge.gov.br/api/v1/localidades/estados/{state.upper()}/municipios"
    try:
        response = requests.get(url, timeout=20)
        response.raise_for_status()
        rows = response.json()
    except Exception:
        return {}
    mapping: dict[str, str] = {}
    for row in rows:
        code7 = str(row.get("id", "")).strip()
        name = compact(row.get("nome"), 120)
        if code7 and name:
            mapping[code7] = name
            mapping[code7[:6]] = name
    return mapping


def cbo_specialty(cbo: str | None) -> str | None:
    if not cbo:
        return None
    code = re.sub(r"\D", "", cbo)
    if not code.startswith("225"):
        return None
    mapping = {
        "225103": "Médico(a) infectologista",
        "225105": "Médico(a) acupunturista",
        "225106": "Médico(a) legista",
        "225109": "Médico(a) nefrologista",
        "225110": "Médico(a) alergista e imunologista",
        "225112": "Médico(a) neurologista",
        "225115": "Médico(a) angiologista",
        "225118": "Médico(a) nutrologista",
        "225120": "Médico(a) cardiologista",
        "225121": "Médico(a) oncologista clínico",
        "225122": "Médico(a) cancerologista pediátrico",
        "225124": "Médico(a) pediatra",
        "225125": "Médico(a) clínico",
        "225127": "Médico(a) pneumologista",
        "225130": "Médico(a) de família e comunidade",
        "225133": "Médico(a) psiquiatra",
        "225135": "Médico(a) dermatologista",
        "225136": "Médico(a) reumatologista",
        "225139": "Médico(a) sanitarista",
        "225140": "Médico(a) do trabalho",
        "225142": "Médico(a) da estratégia de saúde da família",
        "225148": "Médico(a) anatomopatologista",
        "225150": "Médico(a) em medicina intensiva",
        "225151": "Médico(a) anestesiologista",
        "225155": "Médico(a) endocrinologista e metabologista",
        "225160": "Médico(a) fisiatra",
        "225165": "Médico(a) gastroenterologista",
        "225170": "Médico(a) generalista",
        "225175": "Médico(a) geneticista",
        "225180": "Médico(a) geriatra",
        "225185": "Médico(a) hematologista",
        "225195": "Médico(a) homeopata",
        "225203": "Médico(a) cirurgião vascular",
        "225210": "Médico(a) cirurgião cardiovascular",
        "225215": "Médico(a) cirurgião de cabeça e pescoço",
        "225220": "Médico(a) cirurgião do aparelho digestivo",
        "225225": "Médico(a) cirurgião geral",
        "225230": "Médico(a) cirurgião pediátrico",
        "225235": "Médico(a) cirurgião plástico",
        "225240": "Médico(a) cirurgião torácico",
        "225250": "Médico(a) ginecologista e obstetra",
        "225255": "Médico(a) mastologista",
        "225260": "Médico(a) neurocirurgião",
        "225265": "Médico(a) oftalmologista",
        "225270": "Médico(a) ortopedista e traumatologista",
        "225275": "Médico(a) otorrinolaringologista",
        "225280": "Médico(a) coloproctologista",
        "225285": "Médico(a) urologista",
        "225290": "Médico(a) patologista clínico / medicina laboratorial",
        "225295": "Médico(a) radiologista",
        "225305": "Médico(a) citopatologista",
        "225310": "Médico(a) em endoscopia",
        "225315": "Médico(a) em medicina nuclear",
        "225320": "Médico(a) em radioterapia",
        "225325": "Médico(a) em medicina preventiva e social",
        "225330": "Médico(a) residente",
    }
    return mapping.get(code, f"Médico(a) — CBO {code}")


def build_external_id(row: pd.Series, state: str, competence: str) -> str:
    public_parts = [
        state.upper(),
        competence,
        compact(row.get("CNES"), 32) or "sem-cnes",
        compact(row.get("CODUFMUN"), 7) or "sem-municipio",
        compact(row.get("CBO"), 16) or "sem-cbo",
        normalize_key(compact(row.get("NOMEPROF"), 220)),
        normalize_key(compact(row.get("REGISTRO"), 80)),
    ]
    digest = hashlib.sha256("|".join(public_parts).encode("utf-8")).hexdigest()[:20]
    return f"cnes-pf-{state.lower()}-{competence}-{digest}"


def export_records(state: str, year: int, month: int, limit: int | None) -> list[dict[str, Any]]:
    state = state.upper()
    competence = f"{year}{month:02d}"
    municipalities = fetch_municipalities(state)
    df = pysus.cnes(state, year, month, group="PF")
    records: list[dict[str, Any]] = []
    for _, row in df.iterrows():
        cbo = compact(row.get("CBO"), 16)
        specialty = cbo_specialty(cbo)
        if not specialty:
            continue
        name = compact(row.get("NOMEPROF"), 220)
        cnes = compact(row.get("CNES"), 32)
        mun_code = compact(row.get("CODUFMUN"), 7)
        if not name or not cnes or not mun_code:
            continue
        city = municipalities.get(mun_code) or municipalities.get(mun_code[:6]) or f"Município {mun_code}"
        registro = compact(row.get("REGISTRO"), 80)
        conselho = compact(row.get("CONSELHO"), 40)
        council_type = "crm" if registro else "not_applicable"
        records.append(
            {
                "displayName": name,
                "state": state,
                "city": city,
                "municipalityCode": mun_code,
                "cnesCode": cnes,
                "cboCode": cbo,
                "primarySpecialty": specialty,
                "councilType": council_type,
                "councilNumber": registro,
                "councilState": state,
                "licenseStatus": "Registro CNES ativo na competência informada" if registro else "CNES ativo na competência informada",
                "competence": competence,
                "sourcePath": f"public/data/ftp/cnes/PF{state}{str(year)[-2:]}{month:02d}.parquet",
                "sourceUrl": DATASUS_PORTAL_URL,
                "externalId": build_external_id(row, state, competence),
                "rawEvidence": {
                    "CNES": cnes,
                    "CODUFMUN": mun_code,
                    "CBO": cbo,
                    "CONSELHO": conselho,
                    "REGISTRO_PRESENTE": bool(registro),
                    "COMPETEN": compact(row.get("COMPETEN"), 6) or competence,
                },
            }
        )
        if limit and len(records) >= limit:
            break
    return records


def main() -> None:
    parser = argparse.ArgumentParser(description="Exporta registros médicos CNES/PF sanitizados para JSON operacional.")
    parser.add_argument("--state", default="AC")
    parser.add_argument("--year", type=int, default=2025)
    parser.add_argument("--month", type=int, default=12)
    parser.add_argument("--limit", type=int, default=120)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    records = export_records(args.state, args.year, args.month, args.limit)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "sourceKey": "cnes_datasus_pf",
        "sourceName": "CNES/DATASUS — Profissionais PF",
        "state": args.state.upper(),
        "year": args.year,
        "month": args.month,
        "competence": f"{args.year}{args.month:02d}",
        "records": records,
        "privacy": "CPF e CNS não são exportados nem persistidos. Registro profissional é mantido somente quando disponível como identificador público de conselho.",
    }
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(output), "records": len(records), "state": args.state.upper(), "competence": payload["competence"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
