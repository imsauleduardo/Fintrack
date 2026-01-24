import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Creamos una respuesta inicial
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    // 2. Configuramos el cliente de Supabase para SSR
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    // 3. Obtenemos el usuario (esto refresca la sesión si es necesario)
    const { data: { user } } = await supabase.auth.getUser()

    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
    const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
    const isSetupPage = request.nextUrl.pathname.startsWith('/auth/setup')

    // REGLA 1: Si intenta entrar al Dashboard y NO está logueado -> Al Login
    if (isDashboardPage && !user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // REGLA 2: Si está logueado e intenta ir a Login/Register (pero NO al Setup) -> Al Dashboard
    // Nota: Excluimos /auth/setup para que el onboarding pueda completarse sin interrupciones
    if (user && isAuthPage && !isSetupPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}