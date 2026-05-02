'use client';

import dynamic from 'next/dynamic';
import { PrefectureData } from '@/types';
import { ROUTE_MAP_DATA, RouteMapType } from '@/data/routeMapImages';

const LeafletRouteMap = dynamic(() => import('./LeafletRouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#f8f9fa' }}>
      <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  ),
});

const LEGEND = [
  { color: '#7c9ff5', label: '지하철' },
  { color: '#4ade80', label: '트램 / 노면전차' },
  { color: '#c084fc', label: '경전철' },
  { color: '#94a3b8', label: '모노레일' },
  { color: '#60a5fa', label: '일반 철도' },
];

interface Props {
  prefecture: PrefectureData;
  type: RouteMapType;
  onClose: () => void;
}

export default function RouteImageModal({ prefecture, type, onClose }: Props) {
  const info = ROUTE_MAP_DATA[prefecture.id]?.[type];
  const typeLabel = type === 'subway' ? '지하철' : type === 'tram' ? '트램' : '모노레일';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="border border-slate-600/50 rounded-2xl w-full max-w-3xl flex flex-col overflow-hidden shadow-2xl"
        style={{ background: '#0e1c30', height: '88vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/60 shrink-0">
          <div>
            <h2 className="text-white font-bold text-base">
              {prefecture.name_ko} {typeLabel} 노선도
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              OpenStreetMap 제공 · 노선 위에 마우스를 올리면 이름이 표시됩니다
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4 shrink-0">
            {info && (
              <a
                href={info.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors hidden sm:block"
              >
                공식 노선도 →
              </a>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">
              ✕
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 overflow-hidden">
          <LeafletRouteMap prefectureId={prefecture.id} />
        </div>

        {/* Legend */}
        <div className="shrink-0 px-5 py-2.5 border-t border-slate-700/60 flex flex-wrap gap-x-4 gap-y-1.5">
          {LEGEND.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="inline-block w-6 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
