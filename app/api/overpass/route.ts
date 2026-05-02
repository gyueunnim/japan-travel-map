import { NextRequest, NextResponse } from 'next/server';

// Vercel Hobby 플랜 서버리스 함수 최대 실행 시간 60초로 설정
// (기본값 10초이면 Overpass API 응답 전에 타임아웃됨)
export const maxDuration = 60;

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

export async function POST(request: NextRequest) {
  const body = await request.text();

  let lastError = '';

  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(50000),
      });

      if (!res.ok) {
        lastError = `${endpoint} → HTTP ${res.status}`;
        continue;
      }

      const data = await res.json();
      return NextResponse.json(data);
    } catch (e: any) {
      lastError = `${endpoint} → ${e?.message ?? e}`;
      continue;
    }
  }

  return NextResponse.json(
    { error: '모든 Overpass 서버 연결 실패', detail: lastError },
    { status: 502 },
  );
}
