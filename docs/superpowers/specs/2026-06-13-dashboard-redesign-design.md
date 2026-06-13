# Dashboard-redesign — ApoStatus Oversigt

Dato: 2026-06-13

## Mål

Gøre dashboardet moderne, professionelt og brugbart for apotekspersonale, der laver
lagerstatus. Det skal være fuldt responsivt (pc, tablet, telefon) og på dansk.

Afgrænsning: **ingen backend-/API-/database-ændringer**. Vi arbejder kun med de data
dashboardet allerede modtager.

## Beslutninger (afklaret med bruger)

- **Sprog:** Dansk i hele dashboardet.
- **Omfang:** Visuelt redesign + arbejdsflow-forbedringer (ingen backend-ændringer).
- **Farve:** Behold den grønne apoteks-identitet, men forfin nuancer/kontrast/brug.

## Datagrundlag (uændret)

Pr. session: `id`, `name` (= opretter / "Unknown"), `date` (oprettet), `status`
(`In Progress` | `Review` | `Completed`), `location[]` (lokationskoder, fx `101`),
`stockChecksCount` (antal optalte varer).

Stats: `totalSessions`, `completedSessions`, `reviewSessions`, `needsReview`.
`Igangværende` udregnes klient-side: `total − completed − review`.

Begrænsning: der er **ikke** et samlet forventet vareantal pr. session, så en ægte
fremdrifts-procent er ikke mulig uden backend-ændring. Vi viser i stedet ærligt
**antal optalte varer**.

Lokationskoder vises som læsbare danske navne via en frontend-mapping (oversat
`LOCATION_MAP` — kun visning, koderne i DB er uændret).

## Layout

### Desktop
1. **Sidehoved:** "Oversigt" + undertekst (apoteksnavn · dato). Primære handlinger:
   "Ny lagerstatus" (grøn, primær) og "Upload fil" (sekundær/outline).
2. **KPI-række:** 4 forfinede stat-kort med ikon og farveaccent:
   Igangværende (blå) · Afventer gennemsyn (gul) · Gennemført `x / y` (grøn) ·
   Næste lagerstatus (neutral, dato).
3. **"Fortsæt hvor du slap":** igangværende sessioner som fremhævede kort med
   lokations-chips, antal optalte varer, relativ starttid og stor
   "Fortsæt optælling →"-knap. Tom-tilstand hvis ingen er i gang.
4. **"Seneste lagerstatusser":** søgefelt + statusfiltre (Alle / Igangværende /
   Gennemsyn / Gennemført), klient-side. Tabel: Lokation · Oprettet af · Dato ·
   Status-pill · rækkehandling.

### Tablet
2-kolonners grids; touch-venlige mål (≥44px).

### Mobil
Ét spor. Stat-kort i 2-kolonners grid. "Fortsæt"-kort stablet. **Tabellen bliver til
stablede kort** (tabeller fungerer dårligt på telefon). Primær handling kan være en
sticky knap i bunden.

## Arbejdsflow-forbedringer

1. **Fortsæt hvor du slap** — hurtig vej tilbage til igangværende optælling.
2. **Søg + statusfiltre** — klient-side filtrering af de seneste sessioner.
3. **Tydeligere status** — farvede pills med ikon (Igang = blå, Gennemsyn = gul,
   Gennemført = grøn) + læsbare lokationsnavne.

## Designsprog

Forfinet grøn primær, mere whitespace, `rounded-xl`-kort med diskret border + skygge,
konsistente lucide-ikoner, tydeligt typografisk hierarki, hover- og fokus-states
(tilgængelighed), touch-venlige tap-targets.

## Berørte filer (forventet)

- `components/dashboard/dashboardClient.tsx` — ny struktur, dansk, filtre.
- `components/dashboard/statsCard.tsx` — ikon + farveaccent.
- `components/dashboard/tableRow.tsx` — pills, lokationsnavne, responsiv.
- Ny: aktiv-optælling-kort + mobil session-kort + status-pill-hjælper.
- `types/api.ts` `LOCATION_MAP` — danske visningsnavne (kun visning).
- Evt. mindre tilføjelser i `app/globals.css` for statusfarver.

Ingen ændringer i API-ruter, Prisma-skema eller server-datahentning.
