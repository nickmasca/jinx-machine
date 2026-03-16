import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isLeagueRoute = createRouteMatcher(['/league(.*)', '/api/predictions(.*)', '/api/groups(.*)'])
const isCronRoute = createRouteMatcher(['/api/cron(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isCronRoute(req)) return // cron routes use CRON_SECRET, not Clerk
  if (isLeagueRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and cron routes
    '/((?!_next|api/cron|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes (except cron)
    '/(api(?!/cron)|trpc)(.*)',
  ],
}
