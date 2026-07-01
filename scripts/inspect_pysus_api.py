from __future__ import annotations

import inspect
import pysus

print("pysus_file=", getattr(pysus, "__file__", None))
print("version=", getattr(pysus, "version", None) or getattr(pysus, "get_version", lambda: None)())
for name in ["cnes", "list_files", "CACHEPATH"]:
    obj = getattr(pysus, name, None)
    print(f"name={name} type={type(obj)} repr={obj!r}")
    try:
        print(f"source_{name}=", inspect.getsource(obj)[:4000])
    except Exception as exc:
        print(f"source_{name}_error={type(exc).__name__}: {exc}")
    try:
        print(f"signature_{name}=", inspect.signature(obj))
    except Exception as exc:
        print(f"signature_{name}_error={type(exc).__name__}: {exc}")
