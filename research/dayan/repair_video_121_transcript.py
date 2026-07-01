from __future__ import annotations

import json
from pathlib import Path

from extract_dayan_transcripts import MANIFEST, fetch_video

rows = json.loads(MANIFEST.read_text(encoding='utf-8'))
row = next(r for r in rows if int(r['index']) == 121)
result = fetch_video(row, overwrite=True)
print(json.dumps(result, ensure_ascii=False, indent=2))

out = Path(__file__).resolve().parent / 'corpus' / 'video_121_transcript_repair_result.json'
out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'WROTE {out}')
