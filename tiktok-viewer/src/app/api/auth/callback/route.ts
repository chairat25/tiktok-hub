import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Redirect back to homepage or specified target state
  const redirectTarget = state ? decodeURIComponent(state) : '/';
  
  return NextResponse.redirect(new URL(redirectTarget, req.url));
}
