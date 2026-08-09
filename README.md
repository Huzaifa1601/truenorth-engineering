# True North Engineering

Static, installable marketing website for True North Engineering. The site uses Supabase for quote storage, analytics events and the protected CRM dashboard.

## Run locally

    node local-server.mjs

Open http://localhost:4173/.

## Supabase setup

1. Create a Supabase project.
2. Run supabase/schema.sql in the Supabase SQL Editor.
3. Run supabase/migrations/002_admin_v2.sql. This enables analytics events, CRM statuses, update/delete policies and the private attachment bucket.
4. In Authentication > Users, create the client/admin user for /admin.html.
5. Keep Email authentication enabled.
6. Set the project URL and publishable anon key in assets/js/supabase-config.js.
7. Add the production site URL in Authentication > URL Configuration > Site URL and Redirect URLs.

The public quote form inserts into Supabase through the REST API. Row Level Security allows public inserts while authenticated users can read and manage requests. The dashboard uses Supabase email/password authentication.

## Dashboard

Open /admin.html after deployment. The dashboard includes overview metrics, visitor sessions, quote activity, conversion, project mix, search, sorting, filtering, CSV export, copy-email, status changes, delete confirmation, dark mode and 30-second refresh.

## Deployment

Upload the project root to Cloudflare Pages, Netlify, GitHub Pages or another static host. Use no build command and publish the repository root. The 404 page, security headers, robots file, sitemap, manifest and service worker are included.

Before launch:

- Replace placeholder phone, email, WhatsApp and address data.
- Replace the Google Search Console token.
- Run every item in LAUNCH_CHECKLIST.md.
- Confirm HTTPS and both root/www DNS records.

The chatbot is grounded by assets/data/knowledge.json. It is intentionally API-key-free; connect an AI provider only through a protected serverless function.
