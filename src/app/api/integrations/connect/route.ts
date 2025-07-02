import { NextResponse } from 'next/server';

/**
 * Simulates connecting to a third-party service by validating an API key.
 * In a real application, this would involve making a call to the service's API.
 */
export async function POST(request: Request) {
  try {
    const { service, apiKey, connect } = await request.json();

    if (typeof service !== 'string' || typeof apiKey !== 'string' || typeof connect !== 'boolean') {
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }

    // On disconnect, always succeed
    if (!connect) {
      console.log(`Simulating disconnect for ${service}...`);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      return NextResponse.json({ success: true, message: 'Disconnected successfully.' });
    }

    // On connect, validate the key
    let isValid = false;
    let errorMessage = 'Invalid API Key. Please check and try again.';

    switch (service) {
      case 'zapier':
        isValid = apiKey.startsWith('https://hooks.zapier.com/');
        if (!isValid) errorMessage = 'Invalid Zapier Webhook URL format.';
        break;
      case 'email':
        isValid = /\S+@\S+\.\S+/.test(apiKey);
        if (!isValid) errorMessage = 'Please enter a valid email address.';
        break;
      case 'whatsapp':
        isValid = apiKey.length > 20; // Generic check
        break;
      case 'meta':
        isValid = apiKey.startsWith('EAA'); // Common prefix for Meta access tokens
        if (!isValid) errorMessage = 'Invalid Meta Access Token format. It should start with "EAA".';
        break;
      case 'google-ads':
        isValid = /\S+@\S+\.\S+/.test(apiKey);
        if (!isValid) errorMessage = 'Please enter a valid email address.';
        break;
      case 'mailchimp':
        isValid = /^[a-f0-9]{32}-us\d{1,2}$/.test(apiKey); // Standard Mailchimp key format
        if (!isValid) errorMessage = 'Invalid Mailchimp API Key format. (e.g., abc...def-us19)';
        break;
      default:
        return NextResponse.json({ message: 'Unknown integration service.' }, { status: 400 });
    }
    
    console.log(`Simulating connect for ${service} with key ${apiKey}. Valid: ${isValid}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    if (isValid) {
      return NextResponse.json({ success: true, message: 'Connected successfully.' });
    } else {
      return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
    }

  } catch (error) {
    console.error('Integration connection error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
