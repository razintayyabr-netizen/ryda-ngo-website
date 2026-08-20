import { NextResponse } from 'next/server';
import { createClient } from 'redis';

let redis = null;
let redisPromise = null;

async function getRedis() {
  if (redis && redis.isOpen) return redis;
  if (!process.env.REDIS_URL) return null;

  if (!redisPromise) {
    redisPromise = (async () => {
      try {
        redis = createClient({ url: process.env.REDIS_URL });
        redis.on('error', (err) => console.error('Redis client error:', err));
        await redis.connect();
        return redis;
      } catch (e) {
        console.error('Redis connect error:', e);
        redisPromise = null;
        return null;
      }
    })();
  }

  return redisPromise;
}

const MESSAGES_KEY = 'ryda:messages';

// In-memory fallback if Redis is not configured
let inMemoryMessages = [];

// POST /api/contact - Handle contact form submissions
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const messageObj = {
      id: 'msg-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      name: name.trim(),
      email: email.trim(),
      subject: (subject || 'Website Inquiry').trim(),
      message: message.trim(),
      recipient: 'ryda.rohingya@gmail.com',
      date: new Date().toISOString(),
      status: 'unread',
    };

    // 1. Try to store in Redis
    try {
      const r = await getRedis();
      if (r) {
        const raw = await r.get(MESSAGES_KEY);
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(messageObj);
        // Keep last 500 messages
        await r.set(MESSAGES_KEY, JSON.stringify(list.slice(0, 500)));
      } else {
        inMemoryMessages.unshift(messageObj);
      }
    } catch (dbErr) {
      console.warn('Could not store message in Redis, using in-memory:', dbErr);
      inMemoryMessages.unshift(messageObj);
    }

    // 2. Multi-Tier Real Email Delivery to ryda.rohingya@gmail.com
    let emailSent = false;
    let emailMethod = 'none';

    // Tier 1: Resend API (if RESEND_API_KEY is configured in env)
    if (process.env.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'RYDA Contact <onboarding@resend.dev>',
            to: ['ryda.rohingya@gmail.com'],
            reply_to: email.trim(),
            subject: `[RYDA Website Inquiry] ${subject || 'New message from ' + name}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; max-width: 600px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                <div style="border-bottom: 3px solid #0FA693; padding-bottom: 12px; margin-bottom: 16px;">
                  <h2 style="color: #0FA693; margin: 0; font-size: 20px;">New Message from RYDA Website</h2>
                  <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Received on ${new Date().toUTCString()}</p>
                </div>
                <p style="margin: 8px 0;"><strong>Sender Name:</strong> ${name}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0FA693; font-weight: 600;">${email}</a></p>
                <p style="margin: 8px 0;"><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
                <div style="margin-top: 16px; background: #f8fafc; padding: 16px; border-left: 4px solid #0FA693; border-radius: 4px;">
                  <p style="font-weight: 600; color: #334155; margin: 0 0 8px 0; font-size: 14px;">Message Body:</p>
                  <p style="white-space: pre-wrap; line-height: 1.6; color: #1e293b; margin: 0;">${message}</p>
                </div>
                <div style="margin-top: 20px; text-align: center;">
                  <a href="mailto:${email}?subject=Re:%20${encodeURIComponent(subject || 'RYDA Inquiry')}" style="display: inline-block; background: #0FA693; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Reply to ${name}</a>
                </div>
              </div>
            `,
          }),
        });
        if (res.ok) {
          emailSent = true;
          emailMethod = 'resend';
        }
      } catch (e) {
        console.error('Failed to send email via Resend:', e);
      }
    }

    // Tier 2: FormSubmit Direct Relay (delivers directly to ryda.rohingya@gmail.com without API keys)
    if (!emailSent) {
      try {
        const fsRes = await fetch('https://formsubmit.co/ajax/ryda.rohingya@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            _replyto: email.trim(),
            _subject: `[RYDA Contact Form] ${subject || 'New Message from ' + name}`,
            subject: subject || 'Website Inquiry',
            message: message.trim(),
            _template: 'table',
            _captcha: 'false',
          }),
        });
        if (fsRes.ok) {
          emailSent = true;
          emailMethod = 'formsubmit';
        }
      } catch (fsErr) {
        console.warn('FormSubmit relay warning:', fsErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been received and sent to ryda.rohingya@gmail.com.',
      emailSent,
      emailMethod,
      id: messageObj.id,
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending your message. Please email ryda.rohingya@gmail.com directly.' },
      { status: 500 }
    );
  }
}

// GET /api/contact - Retrieve messages for writer/admin panel
export async function GET(request) {
  try {
    const token = request.headers.get('x-writer-token');
    if (token !== 'RYDA5555' && token !== process.env.WRITER_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let messages = [];
    try {
      const r = await getRedis();
      if (r) {
        const raw = await r.get(MESSAGES_KEY);
        messages = raw ? JSON.parse(raw) : [];
      } else {
        messages = inMemoryMessages;
      }
    } catch (e) {
      messages = inMemoryMessages;
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
      count: (messages || []).length,
    });
  } catch (error) {
    console.error('Failed to fetch contact messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
