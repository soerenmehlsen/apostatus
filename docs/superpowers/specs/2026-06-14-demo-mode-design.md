# Demo-tilstand på login-siden

**Dato:** 2026-06-14
**Status:** Godkendt design

## Formål

Lade besøgende uden login se og prøve appen. Fra login-siden kan man starte en
demo, navigere overalt og udføre de rigtige flows (oprette stocktake, tælle varer,
godkende) med eksempeldata. Ændringer holder under besøget, men rører aldrig
databasen og nulstilles når demoen forlades. Demoen må ikke kunne eksponere rigtige
apoteksdata.

## Beslutninger

- **Demo-niveau:** Fuldt klikbar med fake data (ikke kun se-tilstand).
- **Data-kilde:** Indbygget eksempeldata (fixtures) i koden — rører aldrig DB.
- **Persistens:** Ændringer holder under hele demo-besøget (client-side state i
  `sessionStorage`), nulstilles ved "Afslut demo" eller genindlæsning af lageret.
- **Teknisk tilgang:** Demo-cookie + fetch-interceptor (Tilgang A). Mindst indgreb
  i eksisterende kode, nem at fjerne, nul risiko for at vise rigtige data.

## Arkitektur

Skrivninger kan ikke gå til serveren i demo (ingen DB-persistens, ville blandes på
tværs af besøgende), så al demo-state lever i browseren. Demo-seamen lægges på
netværks-grænsen: i demo-tilstand wrappes `window.fetch`, så alle `/api/*`-kald
besvares lokalt fra et eksempeldata-lager i stedet for serveren. De eksisterende
komponenter røres derved næsten ikke.

### 1. Ind og ud af demo

- Login-siden (`app/login/page.tsx`) får en **"Prøv demo"-knap** under den
  eksisterende login-knap.
- Knappen sætter en cookie `apostatus_demo=1` (via en server-action eller route
  handler) og navigerer til `/dashboard`.
- En altid-synlig **demo-banner** øverst i layoutet: *"Demo-tilstand — alt er
  eksempeldata og gemmes ikke"* med en **"Afslut demo"**-knap, der rydder cookien
  og `sessionStorage` og navigerer til `/login`.

### 2. Adgang uden login

- `proxy.ts`: hvis `apostatus_demo`-cookie er sat, slippes requesten igennem (som
  var brugeren logget ind). Den rigtige Entra ID-auth ændres ikke.

### 3. Eksempeldata + lager i browseren

- `lib/demo/fixtures.ts`: et fast, realistisk sæt med 3-4 stocktake-sessions i
  forskellige statusser (`In Progress`, `Review`, `Completed`), inkl. produkter,
  lokationer (fra `LOCATION_MAP`) og nogle eksisterende optællinger.
- `lib/demo/store.ts`: et lille lager der seedes fra fixtures, lever i
  `sessionStorage`, og holder alle ændringer under besøget. Nulstilles ved
  "Afslut demo". Modellerer sessions, produkter, stock-checks og uploadede filer
  svarende til de Prisma-modeller API'et returnerer.

### 4. Fetch-interceptor (kernen)

- `lib/demo/interceptor.ts`: når demo-cookie er sat, wrappes `window.fetch`. Kald
  til `/api/*` besvares lokalt fra demo-lageret i stedet for serveren. Øvrige kald
  går uændret videre. Endpoints der skal håndteres:
  - **Læs:** `GET /api/dashboard`, `GET /api/stockcheck/stockdata`,
    `GET /api/review`, `GET /api/newstocktake`, `GET /api/upload`,
    `GET /api/databasestatus`
  - **Skriv:** `POST /api/newsession`, `POST /api/stockcheck/saveproduct`,
    `POST /api/stockcheck/completecheck`, `POST /api/review/confirm`,
    `POST/DELETE /api/upload` — opdaterer lageret, så ændringer holder.
- Svar pakkes i samme `ApiResponse<T>`-form som de rigtige endpoints, så
  komponenterne ikke kan mærke forskel.
- Ikke-demo-brugere rammes aldrig af interceptoren.

### 5. Server-komponenter

De server-sider der henter start-data (`app/dashboard`, `app/stocktake/check`,
`app/review`, `app/upload`, `app/stocktake/new`, samt `app/archive` der læser DB
direkte via `lib/archive-server.ts`) får ét lille tjek: er demo-cookien sat,
springes DB-/API-kaldet over og siden sender tomt start-data, så klienten selv
henter via interceptoren.

### 6. Identitet i demo

- `components/layout/header.tsx` + `UserAvatar`: i demo vises **"Demo-bruger"** og
  en "Afslut demo"-knap i stedet for sign-out-knappen.
- `createdBy` / `checkedBy` sættes til "Demo-bruger" i demo-lageret (kun i
  browseren).

## Berørte/nye filer

**Nye:**
- `lib/demo/fixtures.ts` — eksempeldata
- `lib/demo/store.ts` — sessionStorage-lager + mutationer
- `lib/demo/interceptor.ts` — fetch-wrapper
- `lib/demo/is-demo.ts` — fælles helper til at læse demo-cookien (server + klient)
- En server-action/route til at sætte/rydde demo-cookien
- Demo-banner-komponent + "Prøv demo"-knap

**Ændrede:**
- `app/login/page.tsx` — "Prøv demo"-knap
- `proxy.ts` — slip demo-cookie igennem
- `app/layout.tsx` — montér interceptor + banner i demo
- Server-sider: `app/dashboard`, `app/stocktake/check`, `app/stocktake/new`,
  `app/review`, `app/upload`, `app/archive/**`
- `components/layout/header.tsx` + `UserAvatar` — demo-identitet

## Afgrænsning (YAGNI)

- Ingen DB-tabel, ingen server-side demo-persistens.
- Ingen demo-data på tværs af browsere/enheder — hver besøgende har sit eget
  sessionStorage-lager.
- Demo skriver aldrig til de rigtige API-routes; auth-flowet for rigtige brugere
  er uændret.

## Risici / noter

- At wrappe `window.fetch` er bevidst "magi", men isoleret i `lib/demo/` og let at
  fjerne helt igen.
- Interceptoren skal matche hvert endpoints svar-form præcist; afvigelser vil vise
  sig som tomme/forkerte demo-sider.
