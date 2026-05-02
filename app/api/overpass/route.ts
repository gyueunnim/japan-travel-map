import { NextRequest, NextResponse } from 'next/server';

// Overpass API는 CORS 헤더를 반환하지 않으므로 서버사이드 프록시로 우회
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

export async function POST(request: NextRequest) {
  const body = await request.text();

  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(45000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      return NextResponse.json(data);
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: '모든 Overpass 서버 연결 실패' }, { status: 502 });
}
