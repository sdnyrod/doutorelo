#!/usr/bin/env python3
import json
from pathlib import Path

base = Path('/home/ubuntu/saude-integrativa-ia-dev/research/dayan/corpus/consolidated')
video_index = json.loads((base / 'dayan_video_index.json').read_text(encoding='utf-8'))
theme_index = json.loads((base / 'dayan_theme_index.json').read_text(encoding='utf-8'))
query_theme_index = json.loads((base / 'dayan_query_theme_index.json').read_text(encoding='utf-8'))

print('video_index type:', type(video_index).__name__)
if isinstance(video_index, list):
    print('video_index length:', len(video_index))
    first = video_index[0]
else:
    print('video_index keys:', list(video_index)[:10])
    first = video_index[next(iter(video_index))]
print('video first keys:', list(first.keys()))
print(json.dumps(first, ensure_ascii=False, indent=2)[:3000])

print('\ntheme_index type:', type(theme_index).__name__)
print('theme_index keys:', list(theme_index)[:20] if isinstance(theme_index, dict) else 'list')

print('\nquery_theme_index type:', type(query_theme_index).__name__)
print('query_theme_index keys:', list(query_theme_index)[:20] if isinstance(query_theme_index, dict) else 'list')

with (base / 'dayan_knowledge_chunks.jsonl').open(encoding='utf-8') as f:
    first_chunk = json.loads(next(f))
print('\nchunk keys:', list(first_chunk.keys()))
print(json.dumps(first_chunk, ensure_ascii=False, indent=2)[:3000])
