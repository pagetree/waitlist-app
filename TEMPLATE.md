# Deploy and Host Waitlist with Railway

Waitlist is a one click coming soon page that collects emails, stores them on a persistent volume, and gives you a tiny password protected admin with CSV export. Deploy, open the URL, start collecting demand.

## About Hosting Waitlist

Hosting Waitlist on Railway is a single service deploy. The app listens on the platform port, writes SQLite to a mounted volume at `/data`, and serves a public signup page plus `/admin`. An admin password is generated for you at deploy time. Optional brand variables let you set the site name, headline, support line, CTA, and accent color without touching code.

## Common Use Cases

- Launch a product waitlist before public release
- Collect emails for a beta or private preview
- Run a branded coming soon page on a custom domain
- Export signups as CSV for your mailing tool
- Keep ownership of waitlist data without a SaaS bill

## Dependencies for Waitlist Hosting

- Node.js 22 runtime (via Dockerfile)
- SQLite on a Railway volume mounted at `/data`
- No Redis, no Postgres, no third party API keys

### Deployment Dependencies

- Volume mount path: `/data`
- Healthcheck path: `/health`
- Public HTTP networking enabled
- Admin path: `/admin`

### Template Variables

Set these when publishing the Railway template (Variables tab):

| Variable | Value / notes |
| --- | --- |
| `ADMIN_PASSWORD` | `${{secret()}}` (required, auto generated) |
| `DATA_DIR` | `/data` |
| `SITE_NAME` | `Waitlist` (optional, brand name shown large) |
| `HEADLINE` | `Something worth waiting for` (optional) |
| `SUPPORT_TEXT` | `Leave your email. Be first when we open the doors.` (optional) |
| `CTA_TEXT` | `Join the list` (optional) |
| `ACCENT_COLOR` | `#D4A574` (optional) |

### Implementation Details

1. Deploy the template and open the public Railway URL.
2. Visitors submit an email on the home page.
3. Open `/admin`, sign in with `ADMIN_PASSWORD` from the service variables, then export CSV when needed.

### Why Deploy Waitlist on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying Waitlist on Railway, you are one step closer to supporting a complete full stack application.
