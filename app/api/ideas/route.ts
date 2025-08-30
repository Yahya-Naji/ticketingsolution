import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { title, description, authorId, authorName } = await request.json();
    
    // Add debugging
    console.log('API: Received data:', { title, description, authorId, authorName });
    console.log('API: Request headers:', Object.fromEntries(request.headers.entries()));

    // Validate required fields
    if (!title || !description || !authorId || !authorName) {
      console.log('API: Missing required fields validation failed');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('API: Validation passed, about to create in Firestore...');

    // Create idea in Firestore
    const ideaData = {
      title,
      description,
      authorId,
      authorName,
      status: 'private',
      isPublic: false,
      voteCount: 0,
      commentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastStatusUpdate: serverTimestamp(),
    };

    console.log('API: Idea data to save:', ideaData);
    
    const docRef = await addDoc(collection(db, 'ideas'), ideaData);
    
    console.log('API: Successfully created doc with ID:', docRef.id);

    // Optional: Send notification email if SendGrid is configured
    try {
      if (process.env.SENDGRID_API_KEY && 
          process.env.NOTIFICATION_EMAIL && 
          process.env.SENDGRID_FROM_EMAIL) {
        
        const sgMail = await import('@sendgrid/mail');
        sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
          to: process.env.NOTIFICATION_EMAIL,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: `New Idea Submitted: ${title}`,
          text: `
New idea submitted by ${authorName}:

Title: ${title}
Description: ${description}

View idea: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ideas/${docRef.id}
          `,
          html: `
<h2>New Idea Submitted</h2>
<p><strong>Author:</strong> ${authorName}</p>
<p><strong>Title:</strong> ${title}</p>
<p><strong>Description:</strong></p>
<p>${description.replace(/\n/g, '<br>')}</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ideas/${docRef.id}">View Idea</a></p>
          `,
        };

        await sgMail.default.send(msg);
        console.log('API: Notification email sent successfully');
      } else {
        console.log('API: SendGrid not configured, skipping email notification');
      }
    } catch (emailError) {
      // Log email error but don't fail the request
      console.warn('API: Failed to send notification email:', emailError);
    }

    console.log('API: About to return success response');
    return NextResponse.json({ 
      id: docRef.id, 
      success: true,
      message: 'Idea submitted successfully'
    });
  } catch (error) {
    console.error('API: Error creating idea:', error);
    console.error('API: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to create idea', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}