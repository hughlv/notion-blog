import { NextResponse } from 'next/server';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const assetUrl = searchParams.get('assetUrl');
  const blockId = searchParams.get('blockId');

  if (!assetUrl || !blockId) {
    return NextResponse.json(
      { error: 'Missing assetUrl or blockId' },
      { status: 400 }
    );
  }

  try {
    // Fetch the asset from the provided URL
    const response = await fetch(assetUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.statusText}`);
    }

    // Create a readable stream from the response body
    const stream = response.body;

    if (!stream) {
      throw new Error('Failed to read the response body as stream');
    }

    // Set the appropriate headers for the response
    const headers = new Headers();
    headers.set(
      'Content-Type',
      response.headers.get('Content-Type') || 'application/octet-stream'
    );
    headers.set(
      'Content-Length',
      response.headers.get('Content-Length') || '0'
    );
    headers.set('Content-Disposition', `inline; filename="block-${blockId}"`);

    // Create a response stream
    return new Response(stream, { headers });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch the asset' },
      { status: 500 }
    );
  }
}
