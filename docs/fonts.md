# Font Installation Guide

Mojidata Web App compares glyph shapes from several Japanese character
databases. If the required fonts are missing, characters can render as tofu
boxes, crossed boxes, or with the wrong regional shape.

Install these fonts when running the app locally:

- **IPAmjMincho Ver.006.01**: required for Moji_Joho glyphs.
- **Source Han Serif Version 2.001**: required for regional glyphs and
  Adobe-Japan1 glyphs.

## Download Sources

- IPAmjMincho: <https://moji.or.jp/mojikiban/font/>
- Source Han Serif 2.001 release:
  <https://github.com/adobe-fonts/source-han-serif/releases/tag/2.001R>

Check the license files and notices published with each font before
redistributing them. IPAmjMincho and Source Han Serif are open-source fonts, but
their licenses are maintained by their upstream projects.

## Ubuntu / Debian / WSL

Typical errors:

```text
The glyph is shown as □ or a crossed box.
The Moji_Joho or Adobe-Japan1 comparison shape does not match the expected glyph.
```

Likely cause: the browser cannot find IPAmjMincho or Source Han Serif in the
Linux font search path used by the desktop or WSL environment.

Fix:

1. Create a local font directory:

   ```sh
   mkdir -p ~/.local/share/fonts/mojidata
   ```

2. Download IPAmjMincho from the official IPAmjMincho page and extract the
   archive.

3. Copy the IPAmjMincho font file into the local font directory:

   ```sh
   cp /path/to/IPAmjMincho*.ttf ~/.local/share/fonts/mojidata/
   ```

4. Download Source Han Serif Version 2.001 from the GitHub release. For Japanese
   glyph testing, install the Japanese OTF/OTC or Super OTC package from the
   release assets.

5. Copy the Source Han Serif font files into the local font directory:

   ```sh
   cp /path/to/SourceHanSerif*.otf ~/.local/share/fonts/mojidata/
   ```

   If you downloaded an OTC package instead, copy the `.otc` file:

   ```sh
   cp /path/to/SourceHanSerif*.otc ~/.local/share/fonts/mojidata/
   ```

6. Rebuild the font cache:

   ```sh
   fc-cache -fv ~/.local/share/fonts
   ```

7. Confirm that the fonts are visible:

   ```sh
   fc-match IPAmjMincho
   fc-match "Source Han Serif"
   ```

8. Restart the browser and reload the local Mojidata Web App page.

For a system-wide install, copy the fonts under `/usr/local/share/fonts/` and
run `sudo fc-cache -fv` instead.

## macOS

Typical errors:

```text
Moji_Joho glyphs render as missing glyph boxes.
Regional glyph differences are not visible in Safari or Chrome.
```

Likely cause: the font files were downloaded but not installed into Font Book,
or the browser was already running before the fonts were activated.

Fix:

1. Download IPAmjMincho from the official IPAmjMincho page and extract the
   archive.
2. Download Source Han Serif Version 2.001 from the GitHub release. The Japanese
   OTF/OTC or Super OTC package is usually sufficient for local testing.
3. Double-click the `.ttf`, `.otf`, or `.otc` files and choose **Install Font**
   in Font Book.
4. If Font Book reports a duplicate, keep the newest intended version and remove
   stale local copies.
5. Restart the browser.

You can also install for the current user from Terminal:

```sh
mkdir -p ~/Library/Fonts
cp /path/to/IPAmjMincho*.ttf ~/Library/Fonts/
cp /path/to/SourceHanSerif*.otf ~/Library/Fonts/
```

## Windows

Typical errors:

```text
Characters render as empty boxes.
The installed font appears in Downloads but not in the browser.
```

Likely cause: the archives were extracted but the font files were not installed,
or the browser has not been restarted since installation.

Fix:

1. Download IPAmjMincho from the official IPAmjMincho page and extract the
   archive.
2. Download Source Han Serif Version 2.001 from the GitHub release. Use the
   Japanese OTF/OTC package for Japanese glyph testing.
3. In File Explorer, select the extracted `.ttf`, `.otf`, or `.otc` files.
4. Right-click and choose **Install** or **Install for all users**.
5. Open **Settings > Personalization > Fonts** and confirm that IPAmjMincho and
   Source Han Serif are listed.
6. Restart the browser.

If you are running the app inside WSL but viewing it in a Windows browser,
install the fonts in Windows. If you are using a Linux browser inside WSLg,
follow the Ubuntu / Debian / WSL steps as well.

## Troubleshooting Checklist

- Verify the exact font names with the OS font manager or `fc-match`.
- Remove older duplicate versions if the browser picks the wrong file.
- Restart the browser after installing fonts.
- Hard-refresh the app page after restarting the browser.
- Recheck that IPAmjMincho is used for Moji_Joho glyphs and Source Han Serif is
  available for regional and Adobe-Japan1 glyphs.
