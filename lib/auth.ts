import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import { loginSchema } from '@/lib/validations/usuario'
import { authConfig } from '@/lib/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        await connectDB()

        const usuario = await Usuario.findOne({
          email: (parsed.data.email as string).toLowerCase(),
        }).select('+password')

        if (!usuario || !usuario.password) return null

        const passwordValida = await bcrypt.compare(
          parsed.data.password as string,
          usuario.password
        )
        if (!passwordValida) return null

        return {
          id: usuario._id.toString(),
          name: usuario.name,
          email: usuario.email,
          image: usuario.image,
          onboardingCompleto: usuario.onboardingCompleto,
          negocioId: usuario.negocioId?.toString() ?? null,
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB()
          const existente = await Usuario.findOne({ email: user.email?.toLowerCase() })
          if (!existente) {
            await Usuario.create({
              name: user.name,
              email: user.email?.toLowerCase(),
              image: user.image,
              provider: 'google',
              onboardingCompleto: false,
            })
          }
        } catch {
          return false
        }
      }
      return true
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.onboardingCompleto =
          (user as { onboardingCompleto?: boolean }).onboardingCompleto ?? false
        token.negocioId =
          (user as { negocioId?: string | null }).negocioId ?? null
      }
      if (trigger === 'update' && session) {
        if (session.onboardingCompleto !== undefined) token.onboardingCompleto = session.onboardingCompleto
        if (session.negocioId !== undefined) token.negocioId = session.negocioId
      }
      // DB fallback for Google OAuth tokens missing id
      if (token.email && token.id === undefined) {
        try {
          await connectDB()
          const dbUser = await Usuario.findOne({ email: token.email.toLowerCase() })
          if (dbUser) {
            token.id = dbUser._id.toString()
            token.onboardingCompleto = dbUser.onboardingCompleto
            token.negocioId = dbUser.negocioId?.toString() ?? null
          }
        } catch {
          // ignore DB errors in token refresh
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.onboardingCompleto = (token.onboardingCompleto as boolean) ?? false
        session.user.negocioId = (token.negocioId as string | null) ?? null
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
})

declare module 'next-auth' {
  interface User {
    onboardingCompleto?: boolean
    negocioId?: string | null
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      onboardingCompleto: boolean
      negocioId: string | null
    }
  }
}

