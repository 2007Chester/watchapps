import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join('/');
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  
  const backendUrl = `${BACKEND_URL}/api/${path}${queryString}`;
  
  try {
    const body = request.method !== 'GET' && request.method !== 'HEAD' 
      ? await request.text() 
      : undefined;
    
    const headers: HeadersInit = {};
    
    // Копируем важные заголовки
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    headers['Accept'] = request.headers.get('accept') || 'application/json';
    
    // Логируем для отладки
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Proxy]', {
        method: request.method,
        path,
        backendUrl,
        hasBody: !!body,
      });
    }
    
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
    });
    
    const responseBody = await response.text();
    
    // Логируем ответ для отладки
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Proxy Response]', {
        status: response.status,
        contentType: response.headers.get('content-type'),
        bodyPreview: responseBody.substring(0, 100),
      });
    }
    
    // Проверяем, что ответ не HTML (ошибка проксирования)
    if (responseBody.trim().startsWith('<!DOCTYPE') || responseBody.trim().startsWith('<html')) {
      console.error('[API Proxy] Received HTML instead of JSON:', {
        backendUrl,
        status: response.status,
        bodyPreview: responseBody.substring(0, 200),
      });
      return NextResponse.json(
        { message: 'Proxy error: received HTML instead of JSON', backendUrl },
        { status: 502 }
      );
    }
    
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { message: 'Proxy error', error: error instanceof Error ? error.message : 'Unknown error', backendUrl },
      { status: 500 }
    );
  }
}

