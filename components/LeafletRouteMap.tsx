'use client';

import { useEffect, useRef, useState } from 'react';
import { PREFECTURE_CENTERS } from '@/data/prefectureCoords';

interface RelationMember {
  type: string;
  ref: number;
  role: string;
  geometry?: { lat: number; lon: number }[];
}

interface OverpassRelation {
  type: 'relation';
  id: number;
  tags?: {
    route?: string;
    name?: string;
    'name:ko'?: string;
    'name:en'?: string;
    colour?: string;
    color?: string;
    ref?: string;
  };
  members: RelationMember[];
}

interface OverpassNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    'name:ko'?: string;
    'name:en'?: string;
    railway?: string;
  };
}

interface Props {
  prefectureId: string;
  showBus?: boolean;
}

const RAIL_COLORS: Record<string, string> = {
  subway:     '#7c9ff5',
  tram:       '#4ade80',
  light_rail: '#c084fc',
  monorail:   '#94a3b8',
  rail:       '#60a5fa',
};
const RAIL_WEIGHT: Record<string, number> = {
  subway: 4, tram: 3, light_rail: 3, monorail: 3, rail: 2,
};

function resolveName(tags?: { name?: string; 'name:ko'?: string; 'name:en'?: string; ref?: string }): string {
  if (!tags) return '';
  return tags['name:ko'] ?? tags['name:en'] ?? tags.name ?? tags.ref ?? '';
}

// 캐시
const railCache = new Map<string, OverpassRelation[]>();
const stationCache = new Map<string, OverpassNode[]>();
const busCache = new Map<string, OverpassRelation[]>();

async function fetchRail(lat: number, lon: number, prefId: string): Promise<OverpassRelation[]> {
  if (railCache.has(prefId)) return railCache.get(prefId)!;
  const query = `
    [out:json][timeout:40];
    relation["route"~"subway|tram|light_rail|monorail"]["type"="route"](around:40000,${lat},${lon});
    out geom;
  `;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST', body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error('Overpass error');
  const data = await res.json();
  const result = (data.elements ?? []).filter((el: any) => el.type === 'relation');
  railCache.set(prefId, result);
  return result;
}

async function fetchStations(lat: number, lon: number, prefId: string): Promise<OverpassNode[]> {
  if (stationCache.has(prefId)) return stationCache.get(prefId)!;
  const query = `
    [out:json][timeout:25];
    node["railway"~"station|stop"](around:40000,${lat},${lon});
    out;
  `;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST', body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) return [];
  const data = await res.json();
  const result = (data.elements ?? []).filter((el: any) => el.type === 'node');
  stationCache.set(prefId, result);
  return result;
}

async function fetchBus(lat: number, lon: number, prefId: string): Promise<OverpassRelation[]> {
  const key = prefId + '_bus';
  if (busCache.has(key)) return busCache.get(key)!;
  // 반경 8km — 버스는 데이터가 매우 많으므로 좁게 제한
  const query = `
    [out:json][timeout:30];
    relation["route"="bus"]["type"="route"](around:8000,${lat},${lon});
    out geom;
  `;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST', body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) return [];
  const data = await res.json();
  const result = (data.elements ?? []).filter((el: any) => el.type === 'relation');
  busCache.set(key, result);
  return result;
}

export default function LeafletRouteMap({ prefectureId, showBus = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const busLayerRef  = useRef<any>(null);
  const [status, setStatus]         = useState<'loading' | 'done' | 'empty' | 'error'>('loading');
  const [busLoading, setBusLoading] = useState(false);
  const [busVisible, setBusVisible] = useState(false);

  const center = PREFECTURE_CENTERS[prefectureId] ?? [35.68, 139.69];

  // 초기 철도 + 역 마커 로드
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css' as any);
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, { zoomControl: false }).setView(center, 12);
      mapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org">OSM</a>',
        subdomains: 'abcd', maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      try {
        const [relations, stations] = await Promise.all([
          fetchRail(center[0], center[1], prefectureId),
          fetchStations(center[0], center[1], prefectureId),
        ]);
        if (cancelled) return;
        if (relations.length === 0) { setStatus('empty'); return; }

        const allLatLngs: any[] = [];

        // 철도 노선
        relations.forEach((rel) => {
          const route = rel.tags?.route ?? 'rail';
          const color  = rel.tags?.colour ?? rel.tags?.color ?? RAIL_COLORS[route] ?? '#94a3b8';
          const weight = RAIL_WEIGHT[route] ?? 2;
          const name   = resolveName(rel.tags);
          const segs: [number, number][][] = [];

          rel.members.forEach((m) => {
            if (m.type !== 'way' || !m.geometry?.length) return;
            const coords = m.geometry.map(p => [p.lat, p.lon] as [number, number]);
            if (coords.length >= 2) { segs.push(coords); allLatLngs.push(...coords.map(([a, b]) => L.latLng(a, b))); }
          });
          if (segs.length === 0) return;

          const poly = L.polyline(segs, { color, weight, opacity: 0.92 });
          if (name) poly.bindTooltip(name, { sticky: true, className: 'route-tooltip', direction: 'top', offset: [0, -4] });
          poly.addTo(map);
        });

        // 역 마커 (현재 줌 13 이상에서만 표시)
        const stationIcon = (railway: string) => L.circleMarker([0, 0], {
          radius: railway === 'station' ? 5 : 3,
          fillColor: '#fff',
          color: '#334155',
          weight: 1.5,
          fillOpacity: 1,
        });

        const stationGroup = L.layerGroup().addTo(map);
        stations.forEach((node) => {
          const name = resolveName(node.tags);
          const marker = L.circleMarker([node.lat, node.lon], {
            radius: node.tags?.railway === 'station' ? 5 : 3,
            fillColor: '#ffffff',
            color: '#334155',
            weight: 1.5,
            fillOpacity: 1,
          });
          if (name) marker.bindTooltip(name, { sticky: true, className: 'route-tooltip', direction: 'top', offset: [0, -6] });
          marker.addTo(stationGroup);
        });

        // 줌 레벨 12 미만에서 역 마커 숨기기
        map.on('zoomend', () => {
          if (map.getZoom() < 12) stationGroup.remove();
          else stationGroup.addTo(map);
        });

        if (allLatLngs.length > 0) map.fitBounds(L.latLngBounds(allLatLngs), { padding: [28, 28] });
        setStatus('done');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [prefectureId]);

  // 버스 레이어 토글
  const toggleBus = async () => {
    if (!mapRef.current) return;
    const L = (await import('leaflet')).default;

    if (busVisible) {
      busLayerRef.current?.remove();
      busLayerRef.current = null;
      setBusVisible(false);
      return;
    }

    setBusLoading(true);
    try {
      const routes = await fetchBus(center[0], center[1], prefectureId);
      const group = L.layerGroup().addTo(mapRef.current);
      routes.forEach((rel) => {
        const name = resolveName(rel.tags);
        const segs: [number, number][][] = [];
        rel.members.forEach((m) => {
          if (m.type !== 'way' || !m.geometry?.length) return;
          const coords = m.geometry.map(p => [p.lat, p.lon] as [number, number]);
          if (coords.length >= 2) segs.push(coords);
        });
        if (segs.length === 0) return;
        const poly = L.polyline(segs, { color: '#f59e0b', weight: 1.5, opacity: 0.65, dashArray: '4 4' });
        if (name) poly.bindTooltip(name, { sticky: true, className: 'route-tooltip', direction: 'top', offset: [0, -4] });
        poly.addTo(group);
      });
      busLayerRef.current = group;
      setBusVisible(true);
    } finally {
      setBusLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* 버스 토글 버튼 */}
      {status === 'done' && (
        <button
          onClick={toggleBus}
          disabled={busLoading}
          className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md transition-colors"
          style={{
            background: busVisible ? 'rgba(245,158,11,0.9)' : 'rgba(15,28,50,0.88)',
            color: busVisible ? '#fff' : '#cbd5e1',
            border: `1px solid ${busVisible ? 'rgba(245,158,11,0.6)' : 'rgba(255,255,255,0.12)'}`,
          }}
        >
          🚌 {busLoading ? '불러오는 중…' : busVisible ? '버스 숨기기' : '버스 노선 보기'}
        </button>
      )}

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: 'rgba(248,249,250,0.92)' }}>
          <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-600 text-sm font-medium">노선 데이터 불러오는 중…</p>
          <p className="text-slate-400 text-xs">OpenStreetMap에서 가져오는 중 (최대 40초)</p>
        </div>
      )}
      {status === 'empty' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: 'rgba(248,249,250,0.6)' }}>
          <p className="text-slate-500 text-sm">해당 지역의 노선 데이터가 없습니다</p>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: 'rgba(248,249,250,0.6)' }}>
          <p className="text-red-500 text-sm">데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
        </div>
      )}
    </div>
  );
}
