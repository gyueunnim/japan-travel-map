import { NextRequest, NextResponse } from 'next/server';

// Edge Runtime: Vercel 엣지 네트워크 IP 사용 → Lambda IP 차단 우회
export const runtime = 'edge';

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

export async function POST(request: NextRequest) {
  const body = await request.text();
  const errors: string[] = [];

  for (const endpoint of ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'japan-travel-map/1.0 (https://japan-travel-map-chi.vercel.app)',
        },
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) { errors.push(`${endpoint} → ${res.status}`); continue; }
      const data = await res.json();
      return NextResponse.json(data);
    } catch (e: any) {
      clearTimeout(timer);
      errors.push(`${endpoint} → ${e?.message ?? e}`);
    }
  }

  return NextResponse.json({ error: errors.join(' | ') }, { status: 502 });
}
