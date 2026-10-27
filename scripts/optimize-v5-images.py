from __future__ import annotations

import os
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "weekend-trip-plans-2026-10-31-v5.html")


def limits_for(path: Path) -> tuple[int, int]:
    if "/stays/" in path.as_posix():
        return 800, 72
    return 1100, 74


def optimize_jpeg(path: Path) -> tuple[int, int, str]:
    original_size = path.stat().st_size
    with Image.open(path) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        max_width, quality = limits_for(path)
        if image.width > max_width:
            height = round(image.height * max_width / image.width)
            image = image.resize((max_width, height), Image.Resampling.LANCZOS)

        temp_path = path.with_suffix(path.suffix + ".tmp")
        image.save(temp_path, "JPEG", quality=quality, optimize=True, progressive=True)

    optimized_size = temp_path.stat().st_size
    if optimized_size < original_size:
        os.replace(temp_path, path)
        return original_size, optimized_size, "optimized"

    temp_path.unlink(missing_ok=True)
    return original_size, original_size, "kept"


def main() -> None:
    html = HTML.read_text(encoding="utf-8")
    paths = sorted({ROOT / match for match in re.findall(r'src="(assets/[^"]+)"', html)})
    results = []

    for path in paths:
        if not path.exists():
            raise FileNotFoundError(path)
        if path.suffix.lower() in {".jpg", ".jpeg"}:
            results.append((path, *optimize_jpeg(path)))

    before = sum(item[1] for item in results)
    after = sum(item[2] for item in results)
    print(f"Optimized {len(results)} JPEG files: {before / 1024:.1f} KB -> {after / 1024:.1f} KB")
    for path, old, new, action in sorted(results, key=lambda item: item[1] - item[2], reverse=True)[:10]:
        print(f"{action:9} {path.relative_to(ROOT)} {old / 1024:.1f} KB -> {new / 1024:.1f} KB")


if __name__ == "__main__":
    main()
