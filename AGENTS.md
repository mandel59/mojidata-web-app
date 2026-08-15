# AGENTS.md

- Use **Jujutsu VCS** for version control and commits.  
- Commit with multiple `-m` flags to separate the subject line, description, and generated-by trailer. Specify fileset arguments to control which changes are included in the commit.  
  Example:

  ```sh
  jj commit -m 'Subject line' -m 'Description' -m 'Generated-by: Codex (GPT-5.4)' fileset
  ```

- When running shell commands, **quote file paths** (prefer single quotes) to avoid `zsh` interpreting special characters and expansions.  
  In particular, quote paths containing whitespace or any of these characters/features:
  - Globs: `*`, `?`, `[]`, `()`, `^`, `#`, `~` (zsh glob operators / qualifiers)
  - Brace expansion: `{}`, e.g. `{a,b}`
  - Tilde expansion: `~` (especially at the start of a path)
  - Parameter/command/history expansion: `$...`, `$(...)`, `` `...` ``, `!`
  - Redirection / control operators: `<`, `>`, `|`, `&`, `;`
  Tip: use `--` before path arguments when supported (e.g. `rg -- 'src/app/[lang]/...'`).  
  Example: `sed -n '1,20p' 'src/app/[lang]/search/page.tsx'`

- Many `jj` commands accept positional **fileset** expressions (not raw paths). The default `"path"` pattern is `prefix-glob:"path"` (cwd-relative path prefix + glob syntax).  
  For literal paths containing glob characters like `[]` (e.g. `src/app/[lang]/...`, `...[char]...`), prefer the `cwd:`/`cwd-file:` patterns:
  - `cwd:"path"`: matches cwd-relative path prefix (directory recursively)
  - `file:"path"` or `cwd-file:"path"`: matches cwd-relative exact file path
  Example: `jj diff 'cwd-file:"src/app/[lang]/mojidata/[char]/page.tsx"'`

- When creating temporary `jj workspace` checkouts for comparison or debugging, place them under `workspaces/` in this repository instead of `/tmp`.  
  Example: `jj workspace add 'workspaces/visual-baseline' --name 'visual-baseline' -r '...'`

- Sandbox/approval note: in restricted environments, these typically require permission escalation:
  - `jj commit` (needs to write to `.git/objects` to create commit objects)
  - Integration tests that start local servers / bind ports (e.g. Vite) or launch browsers (e.g. Playwright)

- When running multiple Playwright commands that each rely on `config.webServer`, prefer a **sequential** entrypoint instead of parallel shell execution to avoid local port conflicts.  
  Example: `npm run verify:ui:sequential`

- For partial Playwright runs, prefer the dedicated wrapper so the spec gets its own local server port.  
  Example: `npm run test:e2e:target -- -- 'tests/e2e/mojidata.spec.ts' --project=chromium --grep '...'`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
