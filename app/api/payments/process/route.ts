import { NextRequest, NextResponse } from 'next/server';

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
    const { staffId, amount, month, paymentMethod } = body;

    // Validate input
    if (!staffId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment details' },
        { status: 400 }
      );
    }

    // In production, integrate with payment gateway
    // For now, simulate payment processing
    console.log('Processing payment:');
    console.log('Staff ID:', staffId);
    console.log('Amount:', amount);
    console.log('Month:', month);
    console.log('Method:', paymentMethod);

    // Generate payment reference
    const paymentRef = `PAY-${Date.now()}-${staffId.slice(0, 4)}`;

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      paymentReference: paymentRef,
      amount,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}