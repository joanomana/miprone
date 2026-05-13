import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isApiAuth = pathname.startsWith('/api/auth')
  const isApiPublic = pathname.startsWith('/api/seed') || pathname.startsWith('/api/usuarios')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isOnboarding = pathname.startsWith('/negocio') || pathname.startsWith('/galpon')

  if (isApiAuth || isApiPublic) return NextResponse.next()

  const isLoggedIn = !!session

  if (isAuthPage) {
    if (isLoggedIn) {
      if (!session?.user?.onboardingCompleto) {
        return NextResponse.redirect(new URL('/negocio', req.url))
      }
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url))
  }

  if (!session?.user?.onboardingCompleto && !isOnboarding) {
    return NextResponse.redirect(new URL('/negocio', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)'],
}
