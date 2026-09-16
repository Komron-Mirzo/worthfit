// /api/joinlist/confirm/route.ts
import { NextResponse } from 'next/server';
import { sendJoinlistConfirmationEmail } from '@/app/(dashboard)/actions';

export async function POST(request: Request) {
  const { firstName, email } = await request.json();

  if (!firstName || !email) {
    return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
  }

  const result = await sendJoinlistConfirmationEmail(firstName, email);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}