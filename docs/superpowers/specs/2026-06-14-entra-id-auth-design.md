# Design: Login og auth med Microsoft Entra ID

**Dato:** 2026-06-14
**Status:** Godkendt design (afventer implementeringsplan)

## Formål

ApoStatus har i dag ingen adgangskontrol — alle ruter er åbne. Vi tilføjer
login, så kun medarbejdere i apotekets Microsoft-organisation kan tilgå appen,
og så optællinger/stocktakes attribueres til den indloggede bruger.

## Beslutninger truffet i brainstorm

| Emne | Valg |
|---|---|
| Identitetskilde | Microsoft Entra ID (Azure AD) via OAuth |
| Adgangsbredde | Alle brugere i jeres tenant (single-tenant) |
| Roller | Ingen — logget ind = fuld adgang |
| Bibliotek | Auth.js v5 (`next-auth@beta`) med `MicrosoftEntraID`-provider |
| Session | Krypteret JWT i cookie (ingen DB-tabel) |
| Attribution | `createdBy`/`checkedBy` udfyldes server-side fra sessionen |

## Arkitektur & flow

Standard OAuth authorization-code-flow:

1. Uautentificeret bruger rammer en beskyttet rute → `middleware.ts` redirecter
   til `/login`.
2. Bruger klikker "Log ind med Microsoft" → `signIn("microsoft-entra-id")`
   redirecter til Microsoft.
3. Microsoft redirecter tilbage til
   `/api/auth/callback/microsoft-entra-id`.
4. Auth.js opretter en krypteret JWT-session-cookie.
5. Efterfølgende requests læser sessionen via `auth()` (server) eller
   `useSession()` (klient).

Single-tenant sikres via `AUTH_MICROSOFT_ENTRA_ID_ISSUER`, der peger på den
specifikke tenant — kun konti i den tenant kan logge ind.

## Filer

### Nye filer

- **`auth.ts`** (projektrod) — NextAuth-konfiguration:
  ```ts
  import NextAuth from "next-auth"
  import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

  export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
      MicrosoftEntraID({
        clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
        clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
        issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
      }),
    ],
    session: { strategy: "jwt" },
  })
  ```

- **`app/api/auth/[...nextauth]/route.ts`** — `export const { GET, POST } = handlers`.

- **`middleware.ts`** (rod) — beskytter alt undtagen `/api/auth/*`, `/login`,
  statiske assets (`_next`, billeder, favicon). Uautentificerede sider →
  redirect til `/login`. Bruger `auth`-wrapperen fra Auth.js.

- **`app/login/page.tsx`** — server component med en lille klient-knap, der
  kalder `signIn("microsoft-entra-id", { redirectTo: "/dashboard" })`. Stylet
  med eksisterende `components/ui`-primitiver.

### Ændrede filer

- **`app/layout.tsx`** — `SessionProvider` omkring children + bruger-indikator
  (navn fra session) og en log-ud-knap (`signOut`) i headeren.

- **`app/api/newsession/route.ts`** — `createdBy` udledes fra
  `(await auth())?.user?.name` i stedet for request-body. Klient-feltet
  ignoreres/fjernes fra validation.

- **`app/api/stockcheck/saveproduct/route.ts`** — `checkedBy` udledes fra
  sessionen på samme måde.

- **`lib/validations/session.ts`** og **`lib/validations/stockcheck.ts`** —
  `createdBy`/`checkedBy` fjernes som påkrævede klient-input (server sætter dem).

- **`CLAUDE.md`** — env-tabel udvides (se nedenfor).

- **`AZURE_SETUP.md`** — sektion om Entra-app-registrering og redirect-URIs.

## Miljøvariabler

| Variabel | Påkrævet | Beskrivelse |
|---|---|---|
| `AUTH_SECRET` | Ja | Tilfældig nøgle til at kryptere session-JWT (`npx auth secret`) |
| `AUTH_MICROSOFT_ENTRA_ID_ID` | Ja | Client (application) ID fra Entra-app-registreringen |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | Ja | Client secret fra app-registreringen |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | Ja | Issuer-URL: `https://login.microsoftonline.com/<tenant-id>/v2.0` |

Sættes lokalt i `.env` og i Azure App Service → Configuration → Application
settings.

## Azure-opsætning (manuel, engangs)

1. Entra ID → App registrations → New registration.
2. Redirect-URIs (Web):
   - `http://localhost:3000/api/auth/callback/microsoft-entra-id`
   - `https://<prod-host>/api/auth/callback/microsoft-entra-id`
3. Certificates & secrets → ny client secret.
4. Noter Application (client) ID, Directory (tenant) ID og secret → ind i env.

## Fejlhåndtering

- Mislykket/afbrudt login → Auth.js' error-side med venlig besked.
- Udløbet eller manglende session på en side → middleware redirecter til
  `/login`.
- API-rute kaldt uden session → 401 (via middleware / `auth`-wrapper).

## Sikkerhed

- Attribution sættes server-side fra sessionen — klienten kan ikke forfalske
  hvem der talte/oprettede.
- Single-tenant issuer forhindrer login fra fremmede tenants.
- `@azure/msal-node` og `@azure/identity` bruges ikke længere til auth og kan
  fjernes fra `package.json` (verificeres at de ikke bruges andetsteds først).

## Test

Ingen testsuite i projektet — verificeres manuelt:

- [ ] Lokalt: besøg `/dashboard` uden login → redirect til `/login`.
- [ ] Login med Microsoft-konto → tilbage i appen, navn vist i header.
- [ ] Opret stocktake → `createdBy` = indlogget brugers navn.
- [ ] Tæl et produkt → `checkedBy` = indlogget brugers navn.
- [ ] Log ud → ruter beskyttet igen.
- [ ] API-kald uden cookie → 401.

## Uden for scope (YAGNI)

- Roller/rettigheder (alle har samme adgang).
- Brugertabel i databasen.
- B2C/eksterne brugere.
- Password-baseret login.
