import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { joinlistTable } from '@/lib/db/schema';
import { sendJoinlistConfirmationEmail } from '@/app/(dashboard)/actions';

export async function POST(request: Request) {
  const body = await request.json();
  const { firstName, email, interest } = body;

  if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
    return NextResponse.json({ error: 'First name is required.' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db
    .select({ id: joinlistTable.id })
    .from(joinlistTable)
    .where(eq(joinlistTable.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: 'This email is already on the waitlist.' },
      { status: 409 }
    );
  }

  // 1. Insert into database (this is the critical data we must wait for)
  await db.insert(joinlistTable).values({
    firstName: firstName.trim(),
    email: normalizedEmail,
    interest: interest ?? null,
  });

  // 2. Fire the email in the background without blocking the HTTP response
  sendJoinlistConfirmationEmail(firstName.trim(), normalizedEmail).catch((err) => {
    console.error('Failed to send confirmation email in background:', err);
  });

  // 3. Return success instantly to the frontend!
  return NextResponse.json({ success: true }, { status: 201 });
}