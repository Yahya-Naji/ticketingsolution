import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json();

    // Generate verification token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token in Firestore
    await setDoc(doc(db, 'email_verifications', token), {
      email,
      firstName,
      lastName,
      token,
      expiresAt,
      used: false,
    });

    // Send verification email via SendGrid
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      templateId: process.env.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID!,
      dynamicTemplateData: {
        firstName,
        lastName,
        verificationUrl,
      },
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}