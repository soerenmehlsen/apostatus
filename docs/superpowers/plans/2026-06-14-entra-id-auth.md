# Entra ID Login/Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Microsoft Entra ID login so only the pharmacy's tenant users can access ApoStatus, and attribute stocktakes/counts to the logged-in user automatically.

**Architecture:** Auth.js v5 (`next-auth@beta`) with the `MicrosoftEntraID` provider, JWT-cookie sessions (no DB table), single-tenant via the issuer URL. A root `middleware.ts` gates all routes. `createdBy`/`checkedBy` are set server-side from the session, replacing the manual "initials" inputs which are removed.

**Tech Stack:** Next.js 16 (App Router), React 19, Auth.js v5, Prisma 6 (Azure SQL), Zod 4, Tailwind 4.

**Verification note:** This repo has no test suite (see CLAUDE.md). Verification is `npm run lint`, `npm run build`, and the manual checklist in Task 11. Do not scaffold a test framework — it is disproportionate for OAuth glue that can only be exercised against the live Microsoft service.

**Decisions locked in during planning (previously implicit in the code):**
- The session `name` field was previously the typed initials (`Stocktake - {initials}`). With initials removed, the session name is derived from the logged-in user's name: `Stocktake - {user.name}`.
- The `initials` URL param passed from the new-stocktake page to the check page is removed; identity now comes from the session, server-side.

---

## File Structure

**New files:**
- `auth.ts` — NextAuth config; exports `handlers, auth, signIn, signOut`.
- `app/api/auth/[...nextauth]/route.ts` — re-exports `GET, POST` from handlers.
- `middleware.ts` — route protection via the `auth` wrapper.
- `app/login/page.tsx` — login page (server component).
- `components/auth/sign-in-button.tsx` — client "Log ind med Microsoft" button.
- `components/auth/sign-out-button.tsx` — client sign-out button for the header.
- `components/providers/session-provider.tsx` — thin client wrapper around `SessionProvider`.
- `.env.example` — documents the required env vars (no secrets).

**Modified files:**
- `app/layout.tsx` — wrap children in the session provider.
- `components/layout/header.tsx` — show user name + sign-out.
- `app/api/newsession/route.ts` — derive `createdBy` and `name` from session.
- `lib/validations/session.ts` — drop `createdBy` from the schema.
- `app/api/stockcheck/saveproduct/route.ts` — derive `checkedBy` from session.
- `components/stocktake/newStocktakeClient.tsx` — remove initials UI/state; stop sending `createdBy`/`initials`.
- `components/stocktake/stockCheckClient.tsx` — remove initials UI/state; stop sending `checkedBy`/reading `initials` param.
- `CLAUDE.md` — extend env var table.
- `AZURE_SETUP.md` — add Entra app-registration section.
- `package.json` — add `next-auth`; remove unused `@azure/msal-node`, `@azure/identity`.

---

## Task 1: Install Auth.js and create the core config

**Files:**
- Modify: `package.json` (via npm)
- Create: `auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `.env.example`

- [ ] **Step 1: Install next-auth v5 (beta)**

Run:
```bash
npm install next-auth@beta
```
Expected: `next-auth` appears in `package.json` dependencies.

- [ ] **Step 2: Generate an AUTH_SECRET and add env vars to `.env`**

Run:
```bash
npx auth secret
```
This writes `AUTH_SECRET` to `.env`. Then append the Entra placeholders to `.env` (replace with real values from Azure later):
```bash
AUTH_MICROSOFT_ENTRA_ID_ID=""
AUTH_MICROSOFT_ENTRA_ID_SECRET=""
AUTH_MICROSOFT_ENTRA_ID_ISSUER=""
```
Expected: `.env` contains all four `AUTH_*` keys.

- [ ] **Step 3: Create `.env.example`**

Create `.env.example`:
```bash
# SQL Server connection string (Azure SQL)
DATABASE_URL=

# Auth.js — random secret, generate with: npx auth secret
AUTH_SECRET=

# Microsoft Entra ID app registration
AUTH_MICROSOFT_ENTRA_ID_ID=
AUTH_MICROSOFT_ENTRA_ID_SECRET=
# Issuer: https://login.microsoftonline.com/<tenant-id>/v2.0
AUTH_MICROSOFT_ENTRA_ID_ISSUER=
```

- [ ] **Step 4: Create `auth.ts` at the project root**

Create `auth.ts`:
```typescript
import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
});
```

- [ ] **Step 5: Create the catch-all auth route handler**

Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 6: Verify it compiles**

Run: `npm run lint`
Expected: no errors referencing `auth.ts` or the route handler.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json auth.ts app/api/auth .env.example
git commit -m "feat: add Auth.js v5 config with Microsoft Entra ID provider"
```

---

## Task 2: Add route-protection middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Create `middleware.ts` at the project root**

Create `middleware.ts`. The `auth` wrapper attaches the session to `req.auth`; when absent we redirect to `/login`. The matcher excludes Next internals and static assets; the auth API routes and the login page are allowed through by the early-return checks.
```typescript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Always allow the auth endpoints and the login page through.
  if (pathname.startsWith("/api/auth") || pathname === "/login") {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except Next internals and common static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Verify unauthenticated redirect works**

Run: `npm run dev`, then in another terminal:
```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/dashboard
```
Expected: `307` with a redirect URL containing `/login`. Stop the dev server afterwards.

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "feat: protect all routes with auth middleware"
```

---

## Task 3: Build the login page

**Files:**
- Create: `components/auth/sign-in-button.tsx`
- Create: `app/login/page.tsx`

- [ ] **Step 1: Create the sign-in button (client component)**

Create `components/auth/sign-in-button.tsx`:
```tsx
"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <Button
      size="lg"
      className="w-full"
      onClick={() => signIn("microsoft-entra-id", { redirectTo: "/dashboard" })}
    >
      Log ind med Microsoft
    </Button>
  );
}
```

- [ ] **Step 2: Create the login page**

Create `app/login/page.tsx`. If already signed in, bounce to the dashboard.
```tsx
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { SignInButton } from "@/components/auth/sign-in-button";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col items-center justify-center">
      <Card className="w-full items-center gap-6 py-10 text-center">
        <div className="flex size-12 items-center justify-center">
          <Image
            src="/ApoStatusLogo.png"
            alt=""
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <div className="space-y-1 px-6">
          <h1 className="text-xl font-bold">
            Apo<span className="text-primary">Status</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Log ind med din arbejdskonto for at fortsætte.
          </p>
        </div>
        <div className="w-full px-6">
          <SignInButton />
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/login components/auth/sign-in-button.tsx
git commit -m "feat: add login page with Microsoft sign-in"
```

---

## Task 4: Session provider + header user/sign-out

**Files:**
- Create: `components/providers/session-provider.tsx`
- Create: `components/auth/sign-out-button.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/layout/header.tsx`

- [ ] **Step 1: Create the session provider wrapper**

Create `components/providers/session-provider.tsx`:
```tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 2: Wrap the app in `app/layout.tsx`**

In `app/layout.tsx`, add the import after the existing imports:
```tsx
import { AuthSessionProvider } from "@/components/providers/session-provider";
```
Then wrap the existing `<ThemeProvider>...</ThemeProvider>` block with `<AuthSessionProvider>`:
```tsx
        <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-background">
              <Header />
              <main className="px-6 py-4">{children}
                 <Toaster />
              </main>
            </div>
          </ThemeProvider>
        </AuthSessionProvider>
```

- [ ] **Step 3: Create the sign-out button (client component)**

Create `components/auth/sign-out-button.tsx`:
```tsx
"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ redirectTo: "/login" })}
      className="text-muted-foreground"
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">Log ud</span>
    </Button>
  );
}
```

- [ ] **Step 4: Show the user + sign-out in the header**

Modify `components/layout/header.tsx`. Make it a server component that reads the session and renders the name. Replace the file with:
```tsx
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";

export async function Header() {
  const session = await auth();
  const userName = session?.user?.name ?? null;

  return (
    <header className="border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <Link href="/" prefetch={true}>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Logo */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
              <Image
                src="/ApoStatusLogo.png"
                alt=""
                width={35}
                height={35}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            {/* Title */}
            <h1 className="text-lg sm:text-xl font-bold">
              Apo<span className="text-primary">Status</span>
            </h1>
          </div>
        </Link>

        {/* Right section */}
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          {userName && (
            <span className="hidden sm:block font-medium text-sm lg:text-base truncate max-w-32 lg:max-w-none">
              {userName}
            </span>
          )}
          {/* Avatar */}
          <div className="w-8 h-8 bg-muted-foreground/60 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-white" />
          </div>
          {userName && <SignOutButton />}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Verify it compiles**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx components/layout/header.tsx components/providers/session-provider.tsx components/auth/sign-out-button.tsx
git commit -m "feat: show logged-in user and sign-out in header"
```

---

## Task 5: Derive `createdBy` and session name from the session

**Files:**
- Modify: `lib/validations/session.ts`
- Modify: `app/api/newsession/route.ts`

- [ ] **Step 1: Drop `createdBy` from the create-session schema**

In `lib/validations/session.ts`, remove the `createdBy` field so the schema becomes:
```typescript
export const createSessionSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  locations: z.array(z.string())
    .min(1, 'At least one location is required')
    .max(20, 'Too many locations selected'),
});
```
Leave the rest of the file unchanged.

- [ ] **Step 2: Set `createdBy` and the session name from the session**

In `app/api/newsession/route.ts`, add the import at the top (after the existing imports):
```typescript
import { auth } from '@/auth';
```
Then replace the handler body's destructuring and `prisma.stocktakeSession.create` call. Change:
```typescript
    const { name, locations, createdBy } = request.validatedData;

    // Create a new stocktake session
    const session = await prisma.stocktakeSession.create({
      data: {
        name: `Stocktake - ${name}`,
        status: 'In Progress',
        createdBy: createdBy,
        createdAt: new Date(),
      },
    });
```
to:
```typescript
    const { locations } = request.validatedData;

    const authSession = await auth();
    const userName = authSession?.user?.name ?? 'Unknown';

    // Create a new stocktake session, attributed to the logged-in user.
    const session = await prisma.stocktakeSession.create({
      data: {
        name: `Stocktake - ${userName}`,
        status: 'In Progress',
        createdBy: userName,
        createdAt: new Date(),
      },
    });
```
Note: `name` is still accepted by the schema (the client still sends it) but is no longer used for the session name. This is intentional — leaving it in the schema avoids a 422 if the client sends it. The next task removes it from the client.

- [ ] **Step 3: Verify it compiles**

Run: `npm run lint`
Expected: no errors. (An "unused `name`" warning is acceptable and resolved in Task 7.)

- [ ] **Step 4: Commit**

```bash
git add lib/validations/session.ts app/api/newsession/route.ts
git commit -m "feat: attribute new stocktake to logged-in user server-side"
```

---

## Task 6: Derive `checkedBy` from the session

**Files:**
- Modify: `app/api/stockcheck/saveproduct/route.ts`

- [ ] **Step 1: Import auth and resolve the user name once per request**

In `app/api/stockcheck/saveproduct/route.ts`, add after the existing imports:
```typescript
import { auth } from '@/auth';
```
At the very start of the `POST` function's `try` block (right after `const body = await request.json();`), add:
```typescript
    const authSession = await auth();
    const checkedBy = authSession?.user?.name ?? 'Unknown';
```

- [ ] **Step 2: Use the server-derived `checkedBy` everywhere in POST**

In `app/api/stockcheck/saveproduct/route.ts`, replace the four occurrences of `checkedBy: checkData.checkedBy,` and the single-operation usage so the session value is always used:
- In the batch update block (line ~29): `checkedBy: checkData.checkedBy,` → `checkedBy,`
- In the batch create block (line ~44): `checkedBy: checkData.checkedBy,` → `checkedBy,`
- In the single-operation destructuring (line ~58): remove `checkedBy` from the destructured list so it reads:
  ```typescript
  const { productId, sessionId, expectedQty, countedQty, variance, status, reason } = body;
  ```
- In the single update block (line ~74): keep `checkedBy,` (now refers to the session-derived const).
- In the single create block (line ~88): keep `checkedBy,` (now refers to the session-derived const).

After the edit, the batch and single paths both write the session-derived `checkedBy`, and the client-supplied value is ignored.

- [ ] **Step 3: Verify it compiles**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/stockcheck/saveproduct/route.ts
git commit -m "feat: attribute stock counts to logged-in user server-side"
```

---

## Task 7: Remove the initials UI from the new-stocktake page

**Files:**
- Modify: `components/stocktake/newStocktakeClient.tsx`

- [ ] **Step 1: Remove initials state and the Step 1 section**

In `components/stocktake/newStocktakeClient.tsx`:
- Remove `const [initials, setInitials] = useState("");` (line ~55).
- Remove the entire `{/* Step 1 — who is counting */}` `<section>...</section>` block (lines ~206-233).
- Remove the now-unused `Input` import (line 17) and the `User` icon import (line 13) if they are no longer referenced elsewhere in the file. (Verify with a search; `Input` and `User` are only used in the removed section.)
- Renumber Step 2's `StepHeading` from `step={2}` to `step={1}`.

- [ ] **Step 2: Update `canStart` to not depend on initials**

Change (line ~136):
```typescript
  const canStart =
    selectedLocations.length > 0 && initials.trim().length > 0 && !isCreating;
```
to:
```typescript
  const canStart = selectedLocations.length > 0 && !isCreating;
```

- [ ] **Step 3: Update the error toast text in `handleStartStocktake`**

Change the toast (line ~141-144) from referencing initials:
```typescript
      toast.error("Mangler oplysninger", {
        description:
          "Skriv dine initialer og vælg mindst én lokation for at starte.",
      });
```
to:
```typescript
      toast.error("Mangler oplysninger", {
        description: "Vælg mindst én lokation for at starte.",
      });
```

- [ ] **Step 4: Stop sending `createdBy`/`name: initials` and the `initials` URL param**

Change the POST body (line ~154-158):
```typescript
        body: JSON.stringify({
          name: initials,
          locations: selectedLocations,
          createdBy: initials,
        }),
```
to:
```typescript
        body: JSON.stringify({
          name: "Stocktake",
          locations: selectedLocations,
        }),
```
And change the redirect params (line ~164-168) to drop `initials`:
```typescript
        const params = new URLSearchParams({
          sessionId: data.data.sessionId,
          locations: selectedLocations.join(","),
        });
```

- [ ] **Step 5: Update the page description copy that mentions "hvem der tæller op"**

In `PageHeader` (line ~360-362), change:
```tsx
          <p className="text-sm text-muted-foreground">
            Vælg hvem der tæller op og hvilke lokationer der skal med.
          </p>
```
to:
```tsx
          <p className="text-sm text-muted-foreground">
            Vælg hvilke lokationer der skal med i denne status.
          </p>
```

- [ ] **Step 6: Verify it compiles and builds**

Run: `npm run lint`
Expected: no errors and no "unused variable" warnings for `initials`, `Input`, or `User`.

- [ ] **Step 7: Commit**

```bash
git add components/stocktake/newStocktakeClient.tsx
git commit -m "feat: remove manual initials from new-stocktake flow"
```

---

## Task 8: Remove the initials usage from the check page

**Files:**
- Modify: `components/stocktake/stockCheckClient.tsx`

- [ ] **Step 1: Remove initials state and its hydration**

In `components/stocktake/stockCheckClient.tsx`:
- Remove the `initials` state (lines ~75-77):
  ```typescript
  const [initials, setInitials] = useState(
    () => initialChecks.find((c) => c.checkedBy)?.checkedBy ?? ""
  );
  ```
- In the `useEffect` reading search params (lines ~106-118), remove the `initialsParam` read and its `setInitials` call, keeping only the `sessionId` handling:
  ```typescript
  useEffect(() => {
    const sessionIdParam = searchParams.get("sessionId");
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
  }, [searchParams]);
  ```
- In `hydrateChecks` (line ~131), remove the line:
  ```typescript
    setInitials((prev) => prev || (checks.find((c) => c.checkedBy)?.checkedBy ?? ""));
  ```

- [ ] **Step 2: Stop sending `checkedBy` from `buildCheck`**

In `buildCheck` (lines ~200-212), remove the `checkedBy: initials,` line from the returned object. Since `checkedBy` is now set server-side, the field is no longer part of the client payload.

Also update the `StockCheckData` interface (line ~49) by removing `checkedBy: string;` so the type matches the new payload.

- [ ] **Step 3: Search for any remaining `initials` references**

Run: `grep -n "initials" components/stocktake/stockCheckClient.tsx`
Expected: no matches. If any remain (e.g. in JSX rendering the counter's initials), remove them — identity is shown in the header now, not on this page.

- [ ] **Step 4: Verify it compiles and builds**

Run: `npm run lint && npm run build`
Expected: build succeeds, no errors.

- [ ] **Step 5: Commit**

```bash
git add components/stocktake/stockCheckClient.tsx
git commit -m "feat: drop manual initials from stock-check page"
```

---

## Task 9: Documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `AZURE_SETUP.md`

- [ ] **Step 1: Extend the env var table in `CLAUDE.md`**

In `CLAUDE.md`, under "## Environment variables", add these rows to the table (after the existing `NODE_ENV` row):
```markdown
| `AUTH_SECRET` | Yes | Random key encrypting the session JWT (`npx auth secret`) |
| `AUTH_MICROSOFT_ENTRA_ID_ID` | Yes | Entra app registration client (application) ID |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | Yes | Entra app registration client secret |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | Yes | `https://login.microsoftonline.com/<tenant-id>/v2.0` |
```

- [ ] **Step 2: Add an Entra app-registration section to `AZURE_SETUP.md`**

Append to `AZURE_SETUP.md`:
```markdown

## Authentication (Microsoft Entra ID)

Auth.js uses an Entra ID app registration for login.

1. **Register the app**
   - Entra ID → App registrations → New registration.
   - Supported account types: single tenant (this organization only).
2. **Add redirect URIs** (platform: Web):
   - `http://localhost:3000/api/auth/callback/microsoft-entra-id` (local dev)
   - `https://<prod-host>/api/auth/callback/microsoft-entra-id` (production)
3. **Create a client secret**
   - Certificates & secrets → New client secret → copy the value immediately.
4. **Collect values into env**
   - `AUTH_MICROSOFT_ENTRA_ID_ID` = Application (client) ID
   - `AUTH_MICROSOFT_ENTRA_ID_SECRET` = the secret value
   - `AUTH_MICROSOFT_ENTRA_ID_ISSUER` = `https://login.microsoftonline.com/<Directory (tenant) ID>/v2.0`
   - `AUTH_SECRET` = output of `npx auth secret`
5. **Set the same values in Azure App Service**
   - Configuration → Application settings → add all four `AUTH_*` keys → Save.
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md AZURE_SETUP.md
git commit -m "docs: document Entra ID auth env vars and setup"
```

---

## Task 10: Remove the unused Azure SDK packages

The brainstorm confirmed `@azure/msal-node` and `@azure/identity` are unused (`grep` over the source found no references). Auth.js replaces them.

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Re-confirm they are unused**

Run:
```bash
grep -rn "@azure/msal\|@azure/identity\|DefaultAzureCredential" app lib hooks components types
```
Expected: no matches. If there ARE matches, STOP and skip this task.

- [ ] **Step 2: Uninstall**

Run:
```bash
npm uninstall @azure/msal-node @azure/identity
```
Expected: both removed from `package.json`.

- [ ] **Step 3: Verify the build still passes**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove unused Azure SDK packages (replaced by Auth.js)"
```

---

## Task 11: Final manual verification

No automated tests exist; verify end-to-end against a real Entra app registration.

**Prerequisite:** the four `AUTH_*` env vars in `.env` are filled with real values from an Entra app registration (see `AZURE_SETUP.md`), and `http://localhost:3000/api/auth/callback/microsoft-entra-id` is registered as a redirect URI.

- [ ] **Step 1: Build and start**

Run: `npm run build && npm run dev`
Expected: server starts on `http://localhost:3000`.

- [ ] **Step 2: Unauthenticated access redirects to login**

Visit `http://localhost:3000/dashboard` in a clean browser session.
Expected: redirected to `/login`.

- [ ] **Step 3: Login works**

Click "Log ind med Microsoft", complete the Microsoft prompt.
Expected: returned to `/dashboard`; your name appears in the header.

- [ ] **Step 4: Attribution on a new stocktake**

Create a new stocktake (no initials field should be present).
Expected: in the DB (Prisma Studio: `npm run db:studio`), the new `stocktake_sessions` row has `createdBy` = your name and `name` = `Stocktake - <your name>`.

- [ ] **Step 5: Attribution on a count**

Count and confirm a product line.
Expected: the `stock_checks` row has `checkedBy` = your name.

- [ ] **Step 6: Sign out re-protects routes**

Click "Log ud".
Expected: redirected to `/login`; visiting `/dashboard` again redirects to `/login`.

- [ ] **Step 7: API rejects unauthenticated calls**

With no session cookie:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/dashboard
```
Expected: `307` (redirect to login) — not `200`.

- [ ] **Step 8: Final lint + build**

Run: `npm run lint && npm run build`
Expected: both pass clean.

---

## Self-Review Notes

- **Spec coverage:** All spec sections map to tasks — Auth.js config (T1), route handler (T1), middleware (T2), login page (T3), layout/header (T4), env vars (T1/T9), Azure setup docs (T9), server-side attribution (T5/T6), validation changes (T5/T6), removal of unused SDKs (T10), manual test checklist (T11). The initials-removal decision (made during planning) is covered by T7/T8.
- **Type consistency:** `checkedBy` removed from `StockCheckData` (T8) matches the payload no longer sending it (T8) and the server deriving it (T6). `createdBy` removed from `createSessionSchema` (T5) matches the client no longer sending it (T7).
- **No placeholders:** every code step shows concrete code; `<prod-host>`/`<tenant-id>` are values the operator fills from Azure, not plan gaps.
