import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.onboardingCompleto =
          (user as { onboardingCompleto?: boolean }).onboardingCompleto ?? false
        token.negocioId =
          (user as { negocioId?: string | null }).negocioId ?? null
      }
      if (trigger === 'update' && session) {
        if (session.onboardingCompleto !== undefined)
          token.onboardingCompleto = session.onboardingCompleto
        if (session.negocioId !== undefined)
          token.negocioId = session.negocioId
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.onboardingCompleto = (token.onboardingCompleto as boolean) ?? false
        session.user.negocioId = (token.negocioId as string | null) ?? null
      }
      return session
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' as const },
} satisfies NextAuthConfig
