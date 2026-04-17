import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const COCINA_COOKIE = "cocina_token";

/**
 * Refresca la sesión de Supabase y protege rutas según rol.
 * Llamado desde middleware.ts raíz.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: no quitar. Refresca token si expiró.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // --- Cocina: acceso por token fijo (no requiere login de Supabase) ---
  if (pathname.startsWith("/cocina")) {
    const expected = process.env.COCINA_TOKEN;
    const queryToken = request.nextUrl.searchParams.get("token");
    const cookieToken = request.cookies.get(COCINA_COOKIE)?.value;

    // Si pasa token por query, setear cookie y redirigir limpio
    if (expected && queryToken && queryToken === expected) {
      const clean = request.nextUrl.clone();
      clean.searchParams.delete("token");
      const res = NextResponse.redirect(clean);
      res.cookies.set(COCINA_COOKIE, queryToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/cocina",
        maxAge: 60 * 60 * 24 * 30, // 30 días
      });
      return res;
    }

    // Si no hay token configurado en env o no matchea, bloquear
    if (!expected || cookieToken !== expected) {
      const url = request.nextUrl.clone();
      url.pathname = "/cocina-token";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  // --- Rutas protegidas: requieren sesión ---
  const requiereAuth =
    pathname.startsWith("/dashboard") || pathname.startsWith("/mozo");

  if (requiereAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
