import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { ideaId, title, description, authorName } = await request.json();
    
    console.log('NOTIFICATION API: Received request for idea:', ideaId);
    console.log('NOTIFICATION API: Title:', title);
    console.log('NOTIFICATION API: Author:', authorName);

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY || 
        !process.env.NOTIFICATION_EMAIL || 
        !process.env.SENDGRID_FROM_EMAIL) {
      console.log('NOTIFICATION API: SendGrid not configured, skipping email');
      return NextResponse.json({ 
        success: true, 
        message: 'Email not configured' 
      });
    }

    // Import SendGrid dynamically
    const sgMail = await import('@sendgrid/mail');
    sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);

    // Prepare email message
    const msg = {
      to: process.env.NOTIFICATION_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: `New Idea Submitted: ${title}`,
      text: `
New idea submitted by ${authorName}:

Title: ${title}
Description: ${description}

View idea: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ideas/${ideaId}
      `,
      html: `
<h2>New Idea Submitted</h2>
<p><strong>Author:</strong> ${authorName}</p>
<p><strong>Title:</strong> ${title}</p>
<p><strong>Description:</strong></p>
<p>${description.replace(/\n/g, '<br>')}</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ideas/${ideaId}">View Idea</a></p>
      `,
    };

    console.log('NOTIFICATION API: Sending email to:', process.env.NOTIFICATION_EMAIL);
    await sgMail.default.send(msg);
    console.log('NOTIFICATION API: Email sent successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('NOTIFICATION API: Error sending email:', error);
    return NextResponse.json({ 
      error: 'Failed to send notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}
