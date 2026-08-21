# Waitlist

One click waitlist and coming soon page for Railway. Deploy, collect emails, export CSV.

## Quick start on Railway

1. Create a new template or project from this repo.
2. Attach a volume mounted at `/data`.
3. Set variables (see below). Generate `ADMIN_PASSWORD` with `${{secret()}}` in the template composer.
4. Enable public HTTP networking.
5. Deploy. Open the service URL. Admin lives at `/admin`.

Local run (optional):

```bash
cp .env.example .env
npm install
npm start
```

Open `http://localhost:3000`. Do not commit `.env`.

## Environment

| Name | Required | Default | Notes |
| --- | --- | --- | --- |
| `ADMIN_PASSWORD` | yes | `changeme` | Use `${{secret()}}` on Railway templates |
| `DATA_DIR` | yes on Railway | `./data` locally | Must be `/data` with the volume |
| `PORT` | no | `3000` | Railway injects this |
| `SITE_NAME` | no | `Waitlist` | Brand shown as the hero |
| `HEADLINE` | no | `Something worth waiting for` | One line under the brand |
| `SUPPORT_TEXT` | no | see `.env.example` | Short support sentence |
| `CTA_TEXT` | no | `Join the list` | Button label |
| `ACCENT_COLOR` | no | `#D4A574` | CSS color for the CTA |

## Marketplace overview

Copy [TEMPLATE.md](./TEMPLATE.md) into the Railway template overview when you publish.

## Publish checklist

1. Push this repo to GitHub (no `.env`, no SQL dumps, no credentials).
2. Railway → Workspace → Templates → New Template.
3. Add service from the GitHub repo.
4. Variables: `ADMIN_PASSWORD=${{secret()}}`, `DATA_DIR=/data`, optional brand vars.
5. Settings: public HTTP, healthcheck `/health` (also in `railway.toml`).
6. Attach volume at `/data`.
7. Paste overview from `TEMPLATE.md`.
8. Create template, then publish to the marketplace.

## Routes

- `GET /` public waitlist
- `POST /join` email signup
- `GET /admin` admin UI or login
- `GET /admin/export.csv` CSV download
- `GET /health` healthcheck
