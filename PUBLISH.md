# Publish ready checklist

Verified against the plan. No local server was started.

## One click path

- [x] Single service Dockerfile (Node 22 + better-sqlite3 build deps)
- [x] `railway.toml` healthcheck `/health` and Dockerfile builder
- [x] Volume contract: `DATA_DIR=/data` (mount `/data` in template composer)
- [x] `ADMIN_PASSWORD` via `${{secret()}}` documented in `TEMPLATE.md` and `template.config.json`
- [x] Zero required user secrets (password generated on deploy)
- [x] Public page at `/`, admin at `/admin`, CSV at `/admin/export.csv`
- [x] SQLite persistence on volume (survives redeploys)
- [x] `.gitignore` blocks `.env`, credentials patterns, and `*.sql`

## Marketplace listing

- [x] Overview copy in `TEMPLATE.md` follows Railway H1 / H2 / H3 structure
- [x] SEO phrases covered: waitlist, coming soon, email capture, launch
- [x] Publisher steps in `README.md` and variable map in `template.config.json`

## Remaining human steps (you)

1. Push this repo to GitHub (no `.env`).
2. Railway → New Template from the repo.
3. Attach volume at `/data`, set variables from `template.config.json`.
4. Paste `TEMPLATE.md` into the template overview.
5. Publish to the marketplace when ready.
