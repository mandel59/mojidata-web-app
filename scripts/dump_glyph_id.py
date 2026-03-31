import sys

import fontforge

font_list = sys.argv[1:]

if len(font_list) == 0:
    raise SystemExit("usage: dump_glyph_id.py font.ttf...")

print("font_path,name,gid")

for font_path in font_list:
    font = fontforge.open(font_path)

    for gid, g in enumerate(font.glyphs()):
        uni = g.unicode
        altuni = g.altuni
        glyph_names = []
        seen_names = set()

        if uni >= 0:
            uni_str = f"u{uni:04x}"
            glyph_names.append(uni_str)
            seen_names.add(uni_str)

        if altuni is not None:
            for ae in altuni:
                (uni_val, vs, _reserved) = ae
                if uni_val < 0:
                    continue
                altuni_str = (
                    f"u{uni_val:04x}-u{vs:04x}" if vs >= 0 else f"u{uni_val:04x}"
                )
                if altuni_str in seen_names:
                    continue
                glyph_names.append(altuni_str)
                seen_names.add(altuni_str)

        for glyph_name in glyph_names:
            print(f"{font_path},{glyph_name},{gid}")
