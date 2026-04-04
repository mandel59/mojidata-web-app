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
