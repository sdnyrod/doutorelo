from __future__ import annotations

import inspect
from pathlib import Path

import pandas as pd
import pysus


def main() -> None:
    work_dir = Path("/home/ubuntu/saude-integrativa-ia-dev/.tmp/cnes_inspection")
    work_dir.mkdir(parents=True, exist_ok=True)

    files = pysus.list_files("CNES", state="AC", year=2025)
    if files.empty:
        files = pysus.list_files("CNES", state="AC")
    print(f"files_shape={files.shape}")
    print("groups=" + ",".join(sorted(files["group"].dropna().astype(str).unique().tolist())[:80]))
    print(files.tail(20).to_json(orient="records", force_ascii=False, date_format="iso"))

    candidate_groups = ["PF", "ST", "LT", "EQ", "EP"]
    for group in candidate_groups:
        rows = files[files["group"].astype(str).str.upper() == group]
        if rows.empty:
            print(f"group={group} not_found")
            continue
        latest = rows.sort_values(["year", "month"]).tail(1).iloc[0]
        print(f"group={group} latest={latest.to_dict()}")
        try:
            df = pysus.cnes("AC", int(latest["year"]), int(latest["month"]), group=group)
            print(f"group={group} df_shape={df.shape}")
            print("columns=" + ",".join(df.columns.astype(str).tolist()))
            print(df.head(3).to_json(orient="records", force_ascii=False, date_format="iso"))
        except Exception as exc:
            print(f"group={group} error={type(exc).__name__}: {exc}")


if __name__ == "__main__":
    main()
