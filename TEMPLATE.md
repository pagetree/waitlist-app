# Deploy and Host Waitlist with Railway

You need a coming soon page that actually collects emails, not another SaaS signup form you rent forever. Waitlist gives you a public page, a password protected admin, and CSV export. One service. Your data stays on your volume.

## About Hosting Waitlist

This is a single Node app. It serves the signup page on your public URL, stores emails in SQLite on a volume at `/data`, and locks admin behind a password Railway generates for you. Change the brand name, headline, support line, button text, and accent color with variables. No code edits. No Postgres. No Redis. No third party APIs.

After deploy, open the URL and you are live. Admin lives at `/admin`. Export whenever you are ready to send those emails somewhere else.

## Common Use Cases

**Pre launch demand**  
Ship a landing page before the product exists. Prove people want it, then build with a real list instead of a gut feeling.

**Beta and private preview**  
Collect emails for early access. Export CSV and drip invites when you are ready. No mailing platform required on day one.

**Coming soon on your own brand**  
Point a custom domain at the service, set `SITE_NAME`, headline, and accent, and look intentional instead of “parked domain.”

**Agency and client teasers**  
Spin up a client waitlist in one click, hand them `/admin`, and move on. No shared SaaS seat. No monthly per project fee for a form.

**Side projects and indie launches**  
Validate an idea over a weekend. Keep costs tiny. Own the emails when you graduate to Mailchimp, Loops, Resend, or whatever you pick later.

**Event, drop, or waitlist only launches**  
Concerts, merch drops, course openings, community invites. One page, one job: get the email.

## What It Is Good For

Waitlist is good when you need email capture now and marketing tooling later. It is not a CRM, not a newsletter engine, and not a full marketing site. That is the point.

It shines when:

- You want live in minutes, not a week of form wiring
- You care who owns the signup database
- You want one URL to share on Twitter, Product Hunt, or ads
- You need CSV out, not another vendor lock in
- You are fine branding with variables instead of a design system

Skip it if you already need drip campaigns, A/B tests, or a full CMS. Use those tools after you have people to talk to.

## Why Use It

**You own the list**  
Emails live in SQLite on your Railway volume. Redeploys keep them. You are not renting a waitlist SaaS that can raise prices or lock exports.

**Almost zero moving parts**  
One service. One volume. No Postgres add on. No Redis. No API keys for Day 1. Less to break while you are still finding product market fit.

**Admin without ceremony**  
Password is generated on deploy. Open `/admin`, see who joined, download CSV. That is the whole ops story.

**Looks like your product, not a template clone**  
Change brand, copy, and accent without opening the repo. Ship the same stack for ten different launches if you want.

**Cheap enough to leave running**  
A small Node process and a little disk. Leave it up while you build. Turn it off when the real app ships.

## Dependencies for Waitlist Hosting

- Node.js 22 (shipped in the Dockerfile)
- A Railway volume mounted at `/data` for SQLite
- Nothing else. No paid email API. No database add on.

### Deployment Dependencies

- Volume mount: `/data`
- Healthcheck: `/health`
- Public HTTP networking: on
- Admin: `/admin`

### Template Variables

Required:

`ADMIN_PASSWORD` = `${{secret()}}`  
Password for `/admin`. Generated on deploy.

`DATA_DIR` = `/data`  
Where SQLite lives. Must match the volume mount.

Optional brand knobs:

`SITE_NAME` = `Waitlist`  
Big brand name on the public page.

`HEADLINE` = `Something worth waiting for`  
Short line under the brand.

`SUPPORT_TEXT` = `Leave your email. Be first when we open the doors.`  
One sentence of support copy.

`CTA_TEXT` = `Join the list`  
Submit button label.

`ACCENT_COLOR` = `#D4A574`  
Button accent. Any CSS color works.

### Implementation Details

Deploy, open the public URL, and share it. People join with an email. You sign in at `/admin` with `ADMIN_PASSWORD` from your service variables, then hit Export CSV when you want the list in your mailing tool.

### Why Deploy Waitlist on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying Waitlist on Railway, you are one step closer to supporting a complete full stack application.
