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

    // 2. Email delivery if SMTP / Resend credentials exist
    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'RYDA Website <onboarding@resend.dev>',
            to: ['ryda.rohingya@gmail.com'],
            reply_to: email,
            subject: `[RYDA Contact] ${subject || 'New message from ' + name}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; max-width: 600px; color: #111;">
                <h2 style="color: #0b4d41; border-bottom: 2px solid #0b4d41; padding-bottom: 8px;">New Contact Form Message</h2>
                <p><strong>From:</strong> ${name} &lt;<a href="mailto:${email}">${email}</a>&gt;</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString('en-US')}</p>
                <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
                <div style="background: #f4f6f8; padding: 16px; border-left: 4px solid #0b4d41; border-radius: 4px; margin-top: 16px;">
                  <p style="white-space: pre-wrap; margin: 0; line-height: 1.6;">${message}</p>
                </div>
              </div>
            `,
          }),
        });
        if (res.ok) emailSent = true;
      } catch (e) {
        console.error('Failed to send email via Resend:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been received and sent to ryda.rohingya@gmail.com.',
      emailSent,
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
