# Cursor documentation index (storefront)

This repo is the **customer website**. API + admin are in sibling `ozelu-backend-v6n`.

## Read first

| Doc | Why |
|-----|-----|
| [AGENTS.md](../AGENTS.md) | Ports, pay flow, where to edit |
| [storefront-routes-and-ui.md](./storefront-routes-and-ui.md) | Every public route + form UI |
| [GUIDE-service-page-css.md](./GUIDE-service-page-css.md) | Service page CSS recipes |
| Sibling `ozelu-backend-v6n/docs/PROJECT-OVERVIEW.md` | Shared architecture |
| Sibling `ozelu-backend-v6n/docs/GUIDE-service-page-flow.md` | Full service-page pipeline |
| Sibling `ozelu-backend-v6n/docs/how-to-change-safely.md` | Isolation + verify |
| Sibling `ozelu-backend-v6n/docs/CURSOR-INDEX.md` | Full doc map including admin |

## Local

```bash
npm run dev
# NEXT_PUBLIC_API_URL=http://localhost:5000
# NEXT_PUBLIC_STRIPE_TEST_TOKEN=<publishable key>
```
