import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // Iterate over all cookies and delete them
  allCookies.forEach((cookie) => {
    // Specifically target supabase cookies or clear all
    cookieStore.delete(cookie.name)
  })

  return NextResponse.json({
    message: 'All cookies have been successfully cleared.',
    clearedCount: allCookies.length,
    suggestion: 'You can now go back to the login page and log in normally.'
  })
}
