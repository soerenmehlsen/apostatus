# Arkiv-side — Design

**Dato:** 2026-06-14
**Status:** Godkendt af bruger, klar til implementeringsplan

## Formål

En arkivside hvor man kan gå tilbage og se alle gennemførte lagerstatusser
over tid. Den skal være nem og brugervenlig, gøre det let at se statusser pr.
år, og lade brugeren klikke ind på en enkelt status og se den fulde optælling.
Designet følger resten af systemet (dashboard- og review-mønstre).

## Beslutninger truffet under brainstorm

| Emne | Valg |
|---|---|
| Indhold | Kun **gennemførte** statusser (status = `Completed`) |
| Detaljevisning | **Dedikeret** skrivebeskyttet arkiv-detaljeside (ikke genbrug af review-siden) |
| Detalje-indhold | **Fuld vareliste + afvigelser** med "kun afvigelser"-toggle |
| Ekstra funktioner | Søg & filtrer · Års-opsummering · CSV-eksport (ikke print) |
| Adgang | **Knap på dashboardet** (ingen header-ændring) |
| Liste-layout | **Accordion pr. år** (tilgang A), nyeste år foldet ud |

## Arkitektur

### Sider & routing

- **`/archive`** — server-komponent (`app/archive/page.tsx`) der henter data via
  `lib/archive-server.ts` og renderer `ArchiveClient`. Følger dashboard-mønsteret
  (server-fetch ved første load), ikke review-sidens client-fetch.
  Egen `app/archive/loading.tsx`.
- **`/archive/[sessionId]`** — server-komponent
  (`app/archive/[sessionId]/page.tsx`) der henter den fulde optælling og renderer
  `ArchiveDetailClient`. Ukendt id, eller en session der ikke er `Completed` →
  venlig "ikke fundet"-tilstand med link tilbage til arkivet. Egen `loading.tsx`.
- Indgang: en **"Arkiv"-knap** tilføjes på dashboardet
  (`components/dashboard/dashboardClient.tsx`, `PageHeader`) ved siden af de
  eksisterende knapper. Ingen ændring af `components/layout/header.tsx`.

### Datalag

Ny `lib/archive-server.ts`:

- `getArchiveData()` — henter alle sessioner med `status = 'Completed'`, beregner
  pr. session et resumé (lokation(er), dato, oprettet af, antal
  uoverensstemmelser, samlet værdiafvigelse) og grupperer pr. år med
  års-aggregater (antal statusser, antal uoverensstemmelser, samlet
  værdiafvigelse). Værdiafvigelse beregnes ved læsning på samme måde som review:
  `variance = countedQty - product.expectedQty`, `value = variance *
  product.price`. Returnerer fallback (tomt) ved DB-fejl, som dashboardet.
- `getArchiveSessionDetail(sessionId)` — henter én gennemført session med alle
  `stockChecks` + `product`, og returnerer session-meta, KPI-resumé og den
  **fulde** vareliste (alle varer, ikke kun afvigelser). Returnerer `null` hvis
  ikke fundet eller ikke `Completed`.

Lokationsnavne via den eksisterende danske `getLocationName` / `LOCATION_MAP`
(`lib/dashboard-display.ts` / `types/api.ts`). Review-API'ets egen forældede
engelske lokationsliste kopieres **ikke**.

### Genbrug & oprydning

- `VarianceBadge` og valuta-formatteren (`formatCurrency` / `da-DK` DKK) trækkes
  ud af `components/review/reviewClient.tsx` til et lille delt modul, så review og
  arkiv deler dem i stedet for at duplikere.
- Genbruger `StatsCard`, `StatusPill` og `Card`/`Table`-primitiverne fra
  `components/ui` og `components/dashboard`.

## Komponenter

### Arkiv-listen (`ArchiveClient`)

- **Accordion pr. år**, nyeste år foldet ud som standard, ældre år foldet sammen.
- Hver års-header viser **års-opsummering**: antal statusser · antal
  uoverensstemmelser · samlet værdiafvigelse (farvet rød/gul som på review).
- Inde i hvert år: liste over statusser i samme stil som dashboardet — **tabel på
  desktop, kort på mobil** (lokationskoder, navn, oprettet af, dato,
  afvigelses-tal). Klik på en status → `/archive/[sessionId]`.
- Øverst: **søgefelt + filtre** (lokation, person). Søgning/filter folder
  automatisk de år ud der har match, og skjuler år uden match.
- **Tom tilstand** hvis ingen gennemførte statusser endnu (kort med besked +
  link tilbage til oversigt).

### Detaljesiden (`ArchiveDetailClient`)

- Skrivebeskyttet — **ingen "bekræft"-knap**.
- Topmeta: lokation, dato, person.
- **KPI-kort** via `StatsCard`: manglende varer, uoverensstemmelser,
  værdiafvigelse.
- **Fuld vareliste**: alle optalte varer med forventet / optalt / afvigelse /
  værdi (desktop-tabel + mobil-kort). Default sorteret så afvigelser ligger
  øverst (efter absolut afvigelse). **"Kun afvigelser"-toggle** filtrerer til
  varer med `variance !== 0`.
- **"Eksportér CSV"-knap** — CSV genereres i browseren ud fra de indlæste data
  (UTF-8 med BOM så Excel viser æøå korrekt). Kolonner: vare, varenr., forventet,
  optalt, afvigelse, værdi. Filnavn fx `lagerstatus-{lokation}-{dato}.csv`. Intet
  ekstra API-endpoint nødvendigt.

## Dataflow

`/archive` (server) → `getArchiveData()` → `ArchiveClient` (client: accordion,
søg/filter over allerede indlæste data).

`/archive/[sessionId]` (server) → `getArchiveSessionDetail(id)` →
`ArchiveDetailClient` (client: sortering, "kun afvigelser"-toggle, CSV-eksport).

## Fejlhåndtering

- Listens server-fetch returnerer tom fallback ved DB-fejl (som dashboardet), så
  siden ikke crasher.
- Detaljesiden viser "ikke fundet"-tilstand hvis sessionen ikke findes eller ikke
  er gennemført.

## Afgrænsninger (YAGNI)

- Al søgning/filtrering sker **klient-side** over de indlæste data — fint til
  forventet datamængde. Paginering/server-side filtrering kan tilføjes senere
  hvis arkivet vokser sig stort.
- **Ingen schema-ændringer** (resumétal beregnes ved læsning, ikke denormaliseret).
- **Ingen** print/PDF-funktion i denne omgang.
- **Ingen** header-/navigationsmenu — kun dashboard-knappen.

## Verifikation

Ingen testsuite i projektet. Verificeres med `npm run lint` og `npm run build`
samt manuel gennemgang i `npm run dev` (liste, accordion, søg/filter, detalje,
toggle, CSV-eksport, tom/ikke-fundet-tilstande).
