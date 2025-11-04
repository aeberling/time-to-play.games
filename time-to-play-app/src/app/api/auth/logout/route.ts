import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth/cookies';

/**
 * POST /api/auth/logout
 * Logout user by clearing authentication cookies
 */
export async function POST() {
  try {
    // Clear authentication cookies
    await clearAuthCookies();

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to logout',
      },
      { status: 500 }
    );
  }
}
