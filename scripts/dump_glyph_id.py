import fontforge

font_list = [
    "src/fonts/jigmo/Jigmo.ttf",
    "src/fonts/jigmo/Jigmo2.ttf",
    "src/fonts/jigmo/Jigmo3.ttf",
]

for font_path in font_list:
    font = fontforge.open(font_path)

    print("font_path,name,gid")

    for gid, g in enumerate(font.glyphs()):
        glyphname = g.glyphname
        uni = g.unicode
        altuni = g.altuni

        if uni >= 0:
            uni_str = f"u{uni:04x}"
            print(f"{font_path},{uni_str},{gid}")

        altuni_str = ""
        if altuni is not None:
            for ae in altuni:
                (uni_val, vs, _reserved) = ae
                altuni_str = f"u{uni_val:04x}-u{vs:04x}"
                print(f"{font_path},{altuni_str},{gid}")
