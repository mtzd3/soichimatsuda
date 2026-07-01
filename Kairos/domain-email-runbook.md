# KairosAI domain and email runbook

Checked: 2026-06-27 10:45 JST

## Decision

Primary recommendation: buy `kairosai.jp`.

Reason:

- `kairosai.com`, `kairos-ai.com`, `kairosai.ai`, and `kairos-ai.ai` are already registered in RDAP.
- `kairosai.jp` returned RDAP 404 at the check time, which usually means no active registration was found. Final availability must still be confirmed in the registrar checkout flow.
- `kairos-ai.jp` is a useful defensive second choice if budget allows.
- `kairosai.co.jp` and `kairos-ai.co.jp` also returned RDAP 404, but `.co.jp` should wait until the company/legal entity setup is clear.

Sources:

- RDAP lookups: [kairosai.com](https://rdap.org/domain/kairosai.com), [kairos-ai.com](https://rdap.org/domain/kairos-ai.com), [kairosai.ai](https://rdap.org/domain/kairosai.ai), [kairos-ai.ai](https://rdap.org/domain/kairos-ai.ai), [kairosai.jp](https://rdap.org/domain/kairosai.jp), [kairos-ai.jp](https://rdap.org/domain/kairos-ai.jp)
- JP domain rules reference: [JPRS JP domain names](https://jprs.jp/en/jpdomain.html)

## Purchase checklist

1. Buy `kairosai.jp` from the registrar account that will remain under company control.
2. Turn on auto-renewal.
3. Store registrar login, recovery email, and 2FA recovery codes in the company password manager.
4. Set registrant/admin contact to the durable company-controlled email when available.
5. Add `kairos-ai.jp` as a defensive registration if the first checkout succeeds.

## DNS baseline

Initial records after purchase:

| Host | Type | Value | Purpose |
| --- | --- | --- | --- |
| `@` | A or CNAME | Hosting provider value | Main website |
| `www` | CNAME | Hosting provider value | Website alias |
| `@` | TXT | `v=spf1 include:_spf.google.com ~all` | Google Workspace SPF |
| Google-generated selector | TXT | Value from Admin Console | DKIM |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:dmarc@kairosai.jp` | DMARC monitoring |

For Google Workspace, use the Admin Console generated values for MX and DKIM, then verify mail delivery before moving DMARC from `p=none` to `quarantine` or `reject`.

Sources:

- [Google Workspace MX setup](https://support.google.com/a/answer/174125)
- [Google Workspace SPF](https://support.google.com/a/answer/33786)
- [Google Workspace DKIM](https://support.google.com/a/answer/180504)
- [Google Workspace DMARC](https://support.google.com/a/answer/2466563)

## Email accounts

Create these first:

| Address | Use |
| --- | --- |
| `contact@kairosai.jp` | Public website, business card, inbound inquiries |
| `soichi@kairosai.jp` | Founder identity |
| `admin@kairosai.jp` | Registrar, cloud, billing, and tool ownership |
| `dmarc@kairosai.jp` | DMARC aggregate reports |

Keep registrar and cloud ownership on `admin@kairosai.jp`, not on an individual's personal address.

## Website launch checklist

1. Publish the static site in `site/` to the chosen host.
2. Add `kairosai.jp` and `www.kairosai.jp` to the host project.
3. Point DNS at the host-provided records.
4. Confirm HTTPS is active on apex and `www`.
5. Redirect `www` to apex or apex to `www`; choose one canonical URL.
6. Replace draft contact details only after mail receipt is verified.

## Linear completion criteria

- MTZ-213 is Done only after the domain is actually purchased and DNS ownership is verified.
- MTZ-214 is Done only after inbound and outbound mail work, SPF/DKIM pass, and DMARC is at least `p=none`.
- MTZ-215 is Done when final name, title, email, and phone/URL are approved for print.
- MTZ-216 is Done when the homepage is deployed on the purchased domain with HTTPS.
