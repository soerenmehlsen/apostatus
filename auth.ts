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
  // The app runs behind Azure App Service's reverse proxy (not Vercel), so
  // Auth.js must trust the forwarded Host header — otherwise sign-in fails in
  // production with UntrustedHost.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
});
