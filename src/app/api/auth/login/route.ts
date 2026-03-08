import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();
  const validPassword = process.env.ADMIN_PASSWORD || 'missioncontrol2025';
  
  if (password === validPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('mc_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  }
  
  return NextResponse.json({ success: false }, { status: 401 });
}