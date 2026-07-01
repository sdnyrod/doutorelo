#!/usr/bin/env python3
"""Run deep multimodal analysis for the Dr. Dayan YouTube corpus.

This script intentionally does not download full videos. It calls the local
`manus-analyze-video` utility for each public YouTube URL and stores one raw
Markdown analysis plus one JSON metadata file per video. It is resumable: already
completed items are skipped unless --overwrite is provided.
"""
from __future__ import annotations

import argparse
import concurrent.futures as futures
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DAYAN_DIR = ROOT / "research" / "dayan"
CORPUS_DIR = DAYAN_DIR / "corpus"
MANIFEST_PATH = CORPUS_DIR / "dayan_video_manifest.json"
ANALYSIS_DIR = CORPUS_DIR / "video_analyses"
STATUS_PATH = CORPUS_DIR / "video_analysis_status.jsonl"
SUMMARY_PATH = CORPUS_DIR / "video_analysis_summary.md"

PROMPT = """
Extraia em português, com profundidade e rigor, o conteúdo educativo deste vídeo para uma base de conhecimento interna de IA.

Retorne em Markdown com as seguintes seções obrigatórias:
1. Tese central do vídeo.
2. Sequência de argumentos na ordem apresentada.
3. Conceitos explicados, com definições em linguagem clara.
4. Metáforas, imagens ou analogias usadas pelo apresentador.
5. Recomendações gerais mencionadas, separando hábitos, alimentos, suplementos, exames, produtos, procedimentos ou encaminhamentos quando aparecerem.
6. Alertas, contraindicações, sinais de risco ou grupos que exigem cuidado.
7. Limites clínicos: aquilo que não deve ser transformado em diagnóstico, prescrição individual, dose ou promessa terapêutica.
8. Tópicos úteis para uma base de conhecimento de IA, em lista objetiva.
9. Frases ou formulações memoráveis apenas quando forem claramente identificáveis no vídeo; se não houver, escreva "não identificado".
10. Resumo operacional para o DOUTORELO: como esse conteúdo pode orientar perguntas, educação e trilhas de continuidade sem simular o apresentador.

Regras: não invente conteúdo ausente; diferencie fato apresentado, inferência educativa e limite clínico; não produza aconselhamento médico individualizado; mantenha rastreabilidade do vídeo analisado.
""".strip()


@dataclass(frozen=True)
class VideoItem:
    index: int
    id: str
    title: str
    url: str
    duration_seconds: float | int | None = None
    duration_string: str | None = None
    theme: str | None = None


def safe_slug(text: str, max_len: int = 80) -> str:
    normalized = re.sub(r"[^A-Za-z0-9._-]+", "_", text.strip())
    normalized = re.sub(r"_+", "_", normalized).strip("_")
    return normalized[:max_len] or "video"


def load_manifest(limit: int | None = None, offset: int = 0) -> list[VideoItem]:
    payload = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if isinstance(payload, dict) and "videos" in payload:
        rows = payload["videos"]
    else:
        rows = payload
    items: list[VideoItem] = []
    for row in rows:
        idx = int(row.get("index") or row.get("position") or len(items) + 1)
        item = VideoItem(
            index=idx,
            id=str(row.get("id") or row.get("video_id") or "").strip(),
            title=str(row.get("title") or "").strip(),
            url=str(row.get("url") or f"https://www.youtube.com/watch?v={row.get('id')}").strip(),
            duration_seconds=row.get("duration_seconds"),
            duration_string=row.get("duration_string"),
            theme=row.get("theme") or row.get("initial_theme") or row.get("theme_initial"),
        )
        if item.id and item.url:
            items.append(item)
    items = sorted(items, key=lambda item: item.index)
    if offset:
        items = [item for item in items if item.index > offset]
    if limit is not None:
        items = items[:limit]
    return items


def output_paths(item: VideoItem) -> tuple[Path, Path]:
    slug = safe_slug(item.title)
    base = f"{item.index:03d}_{item.id}_{slug}"
    return ANALYSIS_DIR / f"{base}.md", ANALYSIS_DIR / f"{base}.json"


def extract_analysis(stdout: str) -> str:
    marker = "Analysis result:"
    if marker in stdout:
        return stdout.split(marker, 1)[1].strip()
    lines = stdout.strip().splitlines()
    # Keep all non-status text as a fallback; this preserves auditability.
    return "\n".join(line for line in lines if not line.startswith("[") and "Status:" not in line).strip()


def analyze_one(item: VideoItem, overwrite: bool, timeout: int) -> dict[str, Any]:
    md_path, json_path = output_paths(item)
    if json_path.exists() and md_path.exists() and not overwrite:
        try:
            existing = json.loads(json_path.read_text(encoding="utf-8"))
            if existing.get("status") == "completed" and existing.get("analysis_word_count", 0) > 40:
                return {**existing, "skipped": True}
        except Exception:
            pass

    started = time.time()
    cmd = ["manus-analyze-video", item.url, PROMPT]
    try:
        proc = subprocess.run(
            cmd,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=timeout,
            cwd=str(ROOT),
        )
        stdout = proc.stdout or ""
        analysis = extract_analysis(stdout)
        status = "completed" if proc.returncode == 0 and len(analysis.split()) > 40 else "failed"
        error = None if status == "completed" else stdout[-2000:]
    except subprocess.TimeoutExpired as exc:
        stdout = (exc.stdout or "") if isinstance(exc.stdout, str) else ""
        analysis = extract_analysis(stdout)
        status = "timeout"
        error = f"timeout_after_{timeout}s"
    except Exception as exc:  # noqa: BLE001 - audit script should record any failure.
        stdout = ""
        analysis = ""
        status = "failed"
        error = f"{type(exc).__name__}: {exc}"

    elapsed = round(time.time() - started, 1)
    md = (
        f"# Vídeo {item.index}: {item.title}\n\n"
        f"- ID: `{item.id}`\n"
        f"- URL: {item.url}\n"
        f"- Duração: {item.duration_string or item.duration_seconds or 'não informada'}\n"
        f"- Tema inicial: {item.theme or 'não classificado'}\n"
        f"- Status de análise: **{status}**\n"
        f"- Tempo de execução: {elapsed}s\n\n"
        "---\n\n"
        f"{analysis or 'Análise não disponível nesta execução.'}\n"
    )
    md_path.write_text(md, encoding="utf-8")

    record: dict[str, Any] = {
        "index": item.index,
        "id": item.id,
        "title": item.title,
        "url": item.url,
        "duration_seconds": item.duration_seconds,
        "duration_string": item.duration_string,
        "initial_theme": item.theme,
        "status": status,
        "analysis_file": str(md_path.relative_to(ROOT)),
        "metadata_file": str(json_path.relative_to(ROOT)),
        "analysis_word_count": len(analysis.split()),
        "analysis_char_count": len(analysis),
        "elapsed_seconds": elapsed,
        "error": error,
        "skipped": False,
    }
    json_path.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    return record


def write_summary(records: list[dict[str, Any]], total_selected: int) -> None:
    counts: dict[str, int] = {}
    words_total = 0
    for rec in records:
        status = str(rec.get("status", "unknown"))
        counts[status] = counts.get(status, 0) + 1
        words_total += int(rec.get("analysis_word_count") or 0)

    lines = [
        "# Resumo da análise multimodal dos vídeos Dr. Dayan",
        "",
        f"Vídeos selecionados nesta execução: **{total_selected}**.",
        f"Registros processados/retornados: **{len(records)}**.",
        f"Palavras úteis extraídas: **{words_total}**.",
        "",
        "| Status | Vídeos |",
        "|---|---:|",
    ]
    for status, count in sorted(counts.items()):
        lines.append(f"| {status} | {count} |")
    lines.extend(["", "## Últimos registros", "", "| # | ID | Status | Palavras | Título |", "|---:|---|---|---:|---|"])
    for rec in sorted(records, key=lambda row: int(row.get("index") or 0))[-30:]:
        title = str(rec.get("title", "")).replace("|", "\\|")
        lines.append(f"| {rec.get('index')} | `{rec.get('id')}` | {rec.get('status')} | {rec.get('analysis_word_count')} | {title} |")
    SUMMARY_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--offset", type=int, default=0)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--timeout", type=int, default=420)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    ANALYSIS_DIR.mkdir(parents=True, exist_ok=True)
    items = load_manifest(limit=args.limit, offset=args.offset)
    if not items:
        print(json.dumps({"error": "no_items"}, ensure_ascii=False))
        return 1

    records: list[dict[str, Any]] = []
    with futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        future_map = {executor.submit(analyze_one, item, args.overwrite, args.timeout): item for item in items}
        for done_count, future in enumerate(futures.as_completed(future_map), start=1):
            item = future_map[future]
            try:
                record = future.result()
            except Exception as exc:  # noqa: BLE001
                record = {
                    "index": item.index,
                    "id": item.id,
                    "title": item.title,
                    "url": item.url,
                    "status": "failed",
                    "analysis_word_count": 0,
                    "error": f"future:{type(exc).__name__}: {exc}",
                }
            records.append(record)
            with STATUS_PATH.open("a", encoding="utf-8") as fh:
                fh.write(json.dumps(record, ensure_ascii=False) + "\n")
            print(json.dumps({
                "done": done_count,
                "of": len(items),
                "index": record.get("index"),
                "id": record.get("id"),
                "status": record.get("status"),
                "words": record.get("analysis_word_count"),
                "skipped": record.get("skipped", False),
            }, ensure_ascii=False), flush=True)

    write_summary(records, len(items))
    print(json.dumps({"processed": len(records), "summary": str(SUMMARY_PATH)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
