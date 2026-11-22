import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000/api/v1';

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (params.path || []).join('/');
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/${path}${search}`;

  const forwardHeaders = new Headers();
  req.headers.forEach((val, key) => {
    const k = key.toLowerCase();
    if (k !== 'host' && k !== 'content-length') {
      forwardHeaders.set(key, val);
    }
  });

  try {
    const isBodyAllowed = !['GET', 'HEAD'].includes(req.method);
    const body = isBodyAllowed ? await req.text() : undefined;

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      // @ts-ignore
      duplex: 'half'
    });

    const contentType = backendRes.headers.get('content-type') || '';
    const setCookie = backendRes.headers.get('set-cookie');

    const responseHeaders: Record<string, string> = {
      'content-type': contentType || 'application/json'
    };
    if (setCookie) {
      responseHeaders['set-cookie'] = setCookie;
    }

    if (contentType.includes('application/json')) {
      const data = await backendRes.json();
      return NextResponse.json(data, {
        status: backendRes.status,
        headers: responseHeaders
      });
    }

    const rawText = await backendRes.text();
    return new NextResponse(rawText, {
      status: backendRes.status,
      headers: responseHeaders
    });
  } catch (err: any) {
    console.error(`[Next.js API Proxy] Failed to reach ${targetUrl}:`, err.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Backend communication error: ' + err.message
      },
      {
        status: 502,
        headers: { 'content-type': 'application/json' }
      }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
