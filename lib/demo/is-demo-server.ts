import { cookies } from "next/headers";
import { DEMO_COOKIE, DEMO_COOKIE_VALUE } from "./is-demo";

/** Server-side: er demo-cookien sat på den indkommende request? */
export async function isDemoServer(): Promise<boolean> {
  const store = await cookies();
  return store.get(DEMO_COOKIE)?.value === DEMO_COOKIE_VALUE;
}
