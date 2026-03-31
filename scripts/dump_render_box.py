import json
import sys

import fontforge


def main():
    if len(sys.argv) not in (2, 3):
        raise SystemExit(
            "usage: dump_render_box.py font.ttf [viewbox_size]"
        )

    font_path = sys.argv[1]
    viewbox_size = int(sys.argv[2]) if len(sys.argv) == 3 else 1024

    font = fontforge.open(font_path)
    ascent = int(font.ascent)
    descent = int(font.descent)
    em = int(font.em)
    ascender = round(viewbox_size * ascent / em)
    descender = round(viewbox_size * descent / em)

    print(
        json.dumps(
            {
                "fontPath": font_path,
                "viewBoxSize": viewbox_size,
                "fontMetrics": {
                    "ascent": ascent,
                    "descent": descent,
                    "em": em,
                },
                "renderBox": {
                    "viewBoxSize": viewbox_size,
                    "fontSize": viewbox_size,
                    "ascender": ascender,
                    "baseline": 0,
                },
                "derived": {
                    "descender": descender,
                },
            },
            ensure_ascii=True,
            indent=2,
        )
    )


main()
