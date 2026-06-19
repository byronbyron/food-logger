import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { JWT } from 'next-auth/jwt';

/**
 * Scope: drive.file
 * Grants access only to files the app creates/opens itself — not the
 * user's whole Drive. The food-log-data.json file will be visible in
 * the user's normal Drive view since this is the non-restrictive
 * "file" scope rather than "appdata".
 */
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.file',
].join(' ');

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = 'https://oauth2.googleapis.com/token';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshed = await res.json();
    if (!res.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      // Google may not return a new refresh_token — keep the old one if so
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token', error);
    // Returning the old token with an error flag lets the client know
    // to prompt for re-authentication if refresh genuinely fails
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: GOOGLE_SCOPES,
          access_type: 'offline', // required to get a refresh_token
          prompt: 'consent', // forces refresh_token on every fresh login
        },
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: persist tokens from the OAuth response
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + (account.expires_at ? account.expires_at * 1000 - Date.now() : 3600 * 1000),
          refreshToken: account.refresh_token,
        };
      }

      // Subsequent requests: return existing token if still valid
      if (Date.now() < (token.accessTokenExpires as number) - 60_000) {
        return token;
      }

      // Token expired (or about to) — refresh it silently
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  pages: {
    // Use the default NextAuth sign-in page; customise later if desired
  },
};

export function getSession() {
  return getServerSession(authOptions);
}
