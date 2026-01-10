import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

export async function POST(request: NextRequest) {
  try {
    // Verify CSRF token
    const csrfToken = request.headers.get('X-CSRF-Token');
    const storedToken = request.cookies.get('csrf-token')?.value;
    
    if (!csrfToken || csrfToken !== storedToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { phones, message, senderId } = body;

    // Decrypt message
    const bytes = CryptoJS.AES.decrypt(
      message,
      process.env.SMS_ENCRYPTION_KEY || 'default-key'
    );
    const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);

    // Validate input
    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return NextResponse.json(
        { error: 'Invalid phone numbers' },
        { status: 400 }
      );
    }

    // In production, integrate with SMS gateway like Twilio, Vonage, etc.
    // For now, simulate sending
    console.log('Sending SMS via gateway:');
    console.log('Sender:', senderId);
    console.log('Phones:', phones);
    console.log('Message:', decryptedMessage);

    // Rate limiting simulation
    if (phones.length > 100) {
      return NextResponse.json(
        { error: 'Bulk SMS limit exceeded (max 100 per request)' },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `SMS sent to ${phones.length} numbers`,
      trackingId: `SMS-${Date.now()}`,
    });
  } catch (error) {
    console.error('SMS API error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}