#!/usr/bin/env python3
from __future__ import annotations

import argparse
import concurrent.futures as futures
import json
import re
import time
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

from youtube_transcript_api import YouTubeTranscriptApi

ROOT = Path(__file__).resolve().parent
CORPUS = ROOT / "corpus"
MANIFEST = CORPUS / "dayan_video_manifest.json"
TRANSCRIPTS = CORPUS / "transcripts"
SEGMENTS = CORPUS / "transcript_segments"
STATUS = CORPUS / "transcript_extraction_status.json"
SUMMARY = CORPUS / "transcript_extraction_summary.md"
TRANSCRIPTS.mkdir(parents=True, exist_ok=True)
SEGMENTS.mkdir(parents=True, exist_ok=True)

LANGS = ["pt", "pt-BR", "en", "en-US", "es", "es-419"]


def as_dict(segment: Any) -> Dict[str, Any]:
    if isinstance(segment, dict):
        return segment
    data = {}
    for key in ("text", "start", "duration"):
        if hasattr(segment, key):
            data[key] = getattr(segment, key)
    if not data and hasattr(segment, "__dict__"):
        data = dict(segment.__dict__)
    return data


def normalize_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    return text


def transcript_to_text(items: Iterable[Any]) -> str:
    parts: List[str] = []
    for item in items:
        data = as_dict(item)
        text = normalize_text(str(data.get("text", "")))
        if text:
            parts.append(text)
    return "\n".join(parts).strip()


def fetch_video(row: Dict[str, Any], overwrite: bool = False) -> Dict[str, Any]:
    idx = int(row["index"])
    video_id = row["video_id"]
    out_txt = TRANSCRIPTS / f"{idx:03d}_{video_id}.txt"
    out_json = SEGMENTS / f"{idx:03d}_{video_id}.json"

    if out_txt.exists() and out_txt.stat().st_size > 0 and not overwrite:
        text = out_txt.read_text(encoding="utf-8", errors="ignore")
        return {
            **row,
            "extraction_status": "available_cached",
            "language": "cached",
            "transcript_chars": len(text),
            "transcript_words": len(text.split()),
            "transcript_path_abs": str(out_txt),
            "segments_path_abs": str(out_json) if out_json.exists() else None,
            "error": None,
        }

    api = YouTubeTranscriptApi()
    errors: List[str] = []
    fetched = None
    language = None

    try:
        fetched = api.fetch(video_id, languages=LANGS)
        language = getattr(fetched, "language_code", None) or getattr(fetched, "language", None) or "unknown"
    except Exception as exc:
        errors.append(f"fetch:{type(exc).__name__}:{str(exc)[:500]}")
        try:
            listing = api.list(video_id)
            selected = None
            preferred = []
            for transcript in listing:
                preferred.append(transcript)
            preferred.sort(key=lambda t: (
                0 if getattr(t, "language_code", "") in LANGS else 1,
                0 if not getattr(t, "is_generated", True) else 1,
            ))
            selected = preferred[0] if preferred else None
            if selected is not None:
                fetched = selected.fetch()
                language = getattr(selected, "language_code", None) or getattr(fetched, "language_code", None) or "unknown"
        except Exception as exc2:
            errors.append(f"list:{type(exc2).__name__}:{str(exc2)[:500]}")

    if fetched is None:
        return {
            **row,
            "extraction_status": "unavailable",
            "language": None,
            "transcript_chars": 0,
            "transcript_words": 0,
            "transcript_path_abs": None,
            "segments_path_abs": None,
            "error": " | ".join(errors),
        }

    segments = [as_dict(item) for item in fetched]
    text = transcript_to_text(segments)
    if not text:
        return {
            **row,
            "extraction_status": "empty",
            "language": language,
            "transcript_chars": 0,
            "transcript_words": 0,
            "transcript_path_abs": None,
            "segments_path_abs": None,
            "error": "empty_transcript_after_fetch",
        }

    header = [
        f"# {row['title']}",
        f"Video ID: {video_id}",
        f"URL: {row['url']}",
        f"Duração: {row['duration_string']}",
        f"Tema inicial: {row['initial_theme_label']}",
        f"Idioma da legenda: {language}",
        "",
        text,
        "",
    ]
    out_txt.write_text("\n".join(header), encoding="utf-8")
    out_json.write_text(json.dumps({"video": row, "language": language, "segments": segments}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {
        **row,
        "extraction_status": "available",
        "language": language,
        "transcript_chars": len(text),
        "transcript_words": len(text.split()),
        "transcript_path_abs": str(out_txt),
        "segments_path_abs": str(out_json),
        "error": None if not errors else " | ".join(errors),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--start", type=int, default=1)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    rows = json.loads(MANIFEST.read_text(encoding="utf-8"))
    selected = [row for row in rows if int(row["index"]) >= args.start]
    if args.limit:
        selected = selected[: args.limit]

    results: List[Dict[str, Any]] = []
    t0 = time.time()
    with futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        future_map = {executor.submit(fetch_video, row, args.overwrite): row for row in selected}
        for n, future in enumerate(futures.as_completed(future_map), start=1):
            row = future_map[future]
            try:
                result = future.result()
            except Exception as exc:
                result = {
                    **row,
                    "extraction_status": "error",
                    "language": None,
                    "transcript_chars": 0,
                    "transcript_words": 0,
                    "transcript_path_abs": None,
                    "segments_path_abs": None,
                    "error": f"worker:{type(exc).__name__}:{str(exc)[:500]}",
                }
            results.append(result)
            print(json.dumps({"done": n, "of": len(selected), "index": result["index"], "status": result["extraction_status"], "words": result["transcript_words"]}, ensure_ascii=False), flush=True)

    results.sort(key=lambda r: int(r["index"]))
    STATUS.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    counts: Dict[str, int] = {}
    words_total = 0
    chars_total = 0
    for r in results:
        counts[r["extraction_status"]] = counts.get(r["extraction_status"], 0) + 1
        words_total += int(r.get("transcript_words") or 0)
        chars_total += int(r.get("transcript_chars") or 0)

    lines = [
        "# Relatório de extração de transcrições Dr. Dayan",
        "",
        f"Vídeos processados nesta execução: **{len(results)}**.",
        f"Palavras extraídas: **{words_total:,}**.",
        f"Caracteres extraídos: **{chars_total:,}**.",
        f"Tempo de execução: **{time.time() - t0:.1f}s**.",
        "",
        "| Status | Vídeos |",
        "|---|---:|",
    ]
    for status, count in sorted(counts.items()):
        lines.append(f"| {status} | {count} |")
    lines.extend([
        "",
        "## Vídeos sem transcrição disponível nesta tentativa",
        "",
        "| # | ID | Título | Erro resumido |",
        "|---:|---|---|---|",
    ])
    for r in results:
        if r["extraction_status"] not in {"available", "available_cached"}:
            title = str(r["title"]).replace("|", "\\|")
            err = normalize_text(str(r.get("error") or ""))[:240].replace("|", "\\|")
            lines.append(f"| {r['index']} | `{r['video_id']}` | {title} | {err} |")
    SUMMARY.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"processed": len(results), "counts": counts, "words_total": words_total, "summary": str(SUMMARY)}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
