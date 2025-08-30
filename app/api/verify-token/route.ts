import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    const tokenDoc = await getDoc(doc(db, 'email_verifications', token));
    
    if (!tokenDoc.exists()) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    const tokenData = tokenDoc.data();
    
    if (tokenData.used) {
      return NextResponse.json(
        { error: 'Verification token has already been used' },
        { status: 400 }
      );
    }

    if (new Date() > tokenData.expiresAt.toDate()) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      email: tokenData.email,
      firstName: tokenData.firstName,
      lastName: tokenData.lastName,
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { token } = await request.json();

    await updateDoc(doc(db, 'email_verifications', token), {
      used: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking token as used:', error);
    return NextResponse.json(
      { error: 'Failed to update token' },
      { status: 500 }
    );
  }
}