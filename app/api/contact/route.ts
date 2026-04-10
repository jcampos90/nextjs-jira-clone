import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/api/prisma';

// Rate limit: 5 submissions per day per IP
const DAILY_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours in ms

// Field length limits
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 600;

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

/**
 * Extract client IP from request headers
 * Handles proxied requests (Vercel, etc.)
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback for local development
  return '127.0.0.1';
}

/**
 * Sanitize input by stripping all HTML tags
 * Prevents XSS attacks in email content
 */
function sanitizeInput(input: string): string {
  // Strip all HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Decode HTML entities that might bypass tag stripping
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Escape special characters for safe insertion in HTML
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit - count submissions from this IP in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const recentSubmissions = await prisma.contactSubmission.count({
      where: {
        ip: clientIP,
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    if (recentSubmissions >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: 'Daily limit exceeded. Please try again tomorrow.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    const data: ContactFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // Sanitize inputs to prevent XSS
    const sanitizedData = {
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      subject: data.subject ? sanitizeInput(data.subject) : '',
      message: sanitizeInput(data.message),
    };

    // Validate field lengths
    if (sanitizedData.name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be ${MAX_NAME_LENGTH} characters or less`, code: 'FIELD_TOO_LONG' },
        { status: 400 }
      );
    }

    if (sanitizedData.email.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { error: `Email must be ${MAX_EMAIL_LENGTH} characters or less`, code: 'FIELD_TOO_LONG' },
        { status: 400 }
      );
    }

    if (sanitizedData.subject && sanitizedData.subject.length > MAX_SUBJECT_LENGTH) {
      return NextResponse.json(
        { error: `Subject must be ${MAX_SUBJECT_LENGTH} characters or less`, code: 'FIELD_TOO_LONG' },
        { status: 400 }
      );
    }

    if (sanitizedData.message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less`, code: 'FIELD_TOO_LONG' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Ensure we have required fields after sanitization
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.message) {
      return NextResponse.json(
        { error: 'Invalid input after sanitization', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    const fromEmail = process.env.MAILGUN_FROM_EMAIL;
    const fromName = process.env.MAILGUN_FROM_NAME;

    if (!apiKey || !domain || !fromEmail) {
      console.error('Missing Mailgun configuration');
      return NextResponse.json(
        { error: 'Server configuration error', code: 'CONFIG_ERROR' },
        { status: 500 }
      );
    }

    // Escape user content for safe HTML insertion
    const safeName = escapeHtml(sanitizedData.name);
    const safeEmail = escapeHtml(sanitizedData.email);
    const safeSubject = escapeHtml(sanitizedData.subject || 'N/A');
    const safeMessage = escapeHtml(sanitizedData.message);

    // Create form data for Mailgun API
    const mailgunFormData = new URLSearchParams();
    mailgunFormData.append('from', `${fromName} <${fromEmail}>`);
    mailgunFormData.append('to', fromEmail);
    mailgunFormData.append('subject', `[TaskFlow Contact] ${safeSubject} from ${safeName}`);
    mailgunFormData.append('html', `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">New Contact Form Submission</h2>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong style="color: #64748b;">From:</strong> <span style="color: #1e293b;">${safeName}</span></p>
          <p style="margin: 0 0 10px 0;"><strong style="color: #64748b;">Email:</strong> <a href="mailto:${safeEmail}" style="color: #4f46e5;">${safeEmail}</a></p>
          <p style="margin: 0 0 10px 0;"><strong style="color: #64748b;">Subject:</strong> <span style="color: #1e293b;">${safeSubject}</span></p>
        </div>

        <div style="margin-top: 20px;">
          <h3 style="color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Message:</h3>
          <p style="color: #1e293b; white-space: pre-wrap; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">${safeMessage}</p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">This message was sent via the TaskFlow contact form.</p>
      </div>
    `);
    mailgunFormData.append('text', `
New Contact Form Submission

From: ${sanitizedData.name}
Email: ${sanitizedData.email}
Subject: ${sanitizedData.subject || 'N/A'}

Message:
${sanitizedData.message}

---
Sent via TaskFlow contact form
    `.trim());

    // Send to Mailgun API
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
      },
      body: mailgunFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mailgun API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to send email', code: 'EMAIL_FAILED' },
        { status: 500 }
      );
    }

    // Record successful submission for rate limiting
    await prisma.contactSubmission.create({
      data: {
        ip: clientIP,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      remainingSubmissions: DAILY_LIMIT - recentSubmissions - 1,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}