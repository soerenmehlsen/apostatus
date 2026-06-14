# Årsag ved afvigelse i optælling — Design

**Dato:** 2026-06-14

## Formål

Når en medarbejder tæller lageret op og en linje ikke stemmer (optalt ≠ forventet),
skal det være hurtigt og nemt at angive en årsag til afvigelsen. Årsagen gemmes
sammen med optællingen og kan ses igen under review og i arkivet.

## Krav

- Årsag er **påkrævet ved enhver afvigelse** (både manko og overskud, dvs. `variance ≠ 0`).
- Linjer der stemmer (`variance === 0`) kræver ikke årsag og viser ikke noget årsags-valg.
- Valget skal være hurtigt — en dropdown med faste valgmuligheder.
- Årsagen skal vises igen på review-siden og i arkiv-detaljer.

## Årsager (faste valgmuligheder)

Defineres ét sted som kode → label, i `types/api.ts` ved siden af `LOCATION_MAP`:

| Kode | Label |
|---|---|
| `shrinkage` | Svind/tyveri |
| `disposal` | Kassation (udløbet/beskadiget) |
| `registration_error` | Registreringsfejl |
| `delivery_error` | Fejl i levering |

En hjælpefunktion `getVarianceReasonLabel(code)` slår label op (analog til `getLocationName`).

## Datamodel

Tilføj ét felt til `StockCheck` i `prisma/schema.prisma`:

```prisma
reason String?   // årsagskode, kun sat når variance ≠ 0
```

- Nullable: linjer uden afvigelse har ingen årsag.
- Migreres med `npm run db:push` (projektet bruger push-flow, ikke migrations-historik).
- `npm run db:generate` køres efter skema-ændring.

## Optællings-flow (dialog ved bekræft)

I `components/stocktake/stockCheckClient.tsx`:

- **Variance === 0:** Tryk på **Bekræft** gemmer linjen som i dag — uændret adfærd.
- **Variance ≠ 0:** Tryk på **Bekræft** åbner en dialog i stedet for at gemme med det samme.
  Dialogen viser:
  - Varenavn (+ varenummer/sku)
  - Forventet, Optalt, Afvigelse (genbrug `VarianceBadge`)
  - En **årsags-dropdown** (Radix `Select`) med de fire årsager.
  - Bekræft-knappen i dialogen er **deaktiveret indtil en årsag er valgt**.
  - Annullér lukker dialogen uden at bekræfte linjen.
- **Genåbning:** Trykkes Fortryd og linjen tælles igen med fortsat afvigelse, er dialogen
  forudfyldt med den tidligere valgte årsag.

### State

- Ny client-state `productReasons: Record<string, string>` (productId → årsagskode).
- Hydreres fra eksisterende checks ved genoptagelse (sammen med `productCounts`/`checkedProducts`).
- `buildCheck(productId)` inkluderer `reason: productReasons[productId] ?? null`.
- `completeStocktake` gen-gemmer via `buildCheck`, så årsager følger med i den endelige gem.

### Nye komponenter

- `components/ui/dialog.tsx` — shadcn-stil primitiv oven på `@radix-ui/react-dialog`
  (tilføjes som dependency; konsistent med de øvrige Radix-primitiver i `components/ui/`).
- `VarianceReasonDialog` — lille komponent der indkapsler dialogens indhold og årsags-dropdown.

## API

`app/api/stockcheck/saveproduct/route.ts`:
- POST (både batch og single) skriver `reason` til `StockCheck` ved create og update.

`app/api/stockcheck/stockdata/route.ts`:
- Returnerer `reason` på eksisterende checks, så det kan hydreres i klienten.

Interfacet `ExistingCheck` og `StockCheckData` i klienten udvides med `reason: string | null`.

Validering håndhæves i UI (dialogen kan ikke bekræftes uden årsag). API'en gemmer hvad
den modtager, som resten af stockcheck-koden gør i dag.

## Review & Arkiv

**Review-siden** (`app/api/review/route.ts` + review-komponent):
- Inkludér `reason` i de beregnede check-resultater.
- Vis årsags-label pr. afvigende vare.

**Arkiv** (`types/archive.ts`, `lib/archive-server.ts`, arkiv-detalje-komponent):
- Tilføj `reason: string | null` til `ArchiveDetailItem`.
- Vis årsags-label pr. afvigende vare på detalje-siden.

I begge tilfælde vises årsag kun for linjer med afvigelse.

## Afgrænsning (YAGNI)

- Ingen fri-tekst/"andet"-årsag i denne omgang — kun de faste valgmuligheder.
- Ingen aggregering/statistik på årsager (fx "samlet svind") i denne omgang.
- Årsager redigeres ikke via UI; de er en kode-konstant.
