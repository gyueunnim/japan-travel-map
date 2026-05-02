'use client';

import { useState } from 'react';
import { PrefectureData, Attraction } from '@/types';
import { difficultyConfig } from '@/data/prefectures';
import { getScoreColor } from '@/utils/scoreColor';
import { ROUTE_MAP_DATA, RouteMapType } from '@/data/routeMapImages';
import RouteImageModal from './RouteImageModal';
import AttractionMapModal from './AttractionMapModal';

const transportIcons: Record<string, { icon: string; label: string }> = {
  subway:       { icon: '🚇', label: '지하철' },
  tram:         { icon: '🚃', label: '트램' },
  shinkansen:   { icon: '🚄', label: '신칸센' },
  localRailway: { icon: '🚆', label: '사철' },
  monorail:     { icon: '🚝', label: '모노레일' },
  touristBus:   { icon: '🚌', label: '관광버스' },
};

const routeMapTypes: Record<string, RouteMapType> = {
  subway:   'subway',
  tram:     'tram',
  monorail: 'monorail',
};

const jrLabels: Record<string, string> = {
  extensive: 'JR 매우 충실',
  good:      'JR 충실',
  limited:   'JR 제한적',
  minimal:   'JR 거의 없음',
};

const busLabels: Record<string, string> = {
  good:    '버스 충실',
  limited: '버스 제한적',
  minimal: '버스 거의 없음',
};

const attractionIcons: Record<string, string> = {
  UNESCO:     '🏛️',
  nature:     '🌿',
  cultural:   '🎭',
  food:       '🍜',
  onsen:      '♨️',
  history:    '⛩️',
  theme_park: '🎡',
};

const starRating = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

interface Props {
  prefecture: PrefectureData | null;
  onClose: () => void;
}

export default function PrefecturePanel({ prefecture, onClose }: Props) {
  const [routeMapType, setRouteMapType] = useState<RouteMapType | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);

  if (!prefecture) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-8 text-center">
        <span className="text-4xl opacity-60">🗾</span>
        <p className="text-sm leading-relaxed">지도에서 도도부현을 클릭하면<br />교통 및 관광 정보를 확인할 수 있습니다.</p>
      </div>
    );
  }

  const cfg = difficultyConfig[prefecture.difficulty];
  const t = prefecture.transport;
  const prefRouteMap = ROUTE_MAP_DATA[prefecture.id];

  const activeTransport = Object.entries(transportIcons).filter(([key]) => {
    const v = t[key as keyof typeof t];
    return v === true;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-700/60">
        <div>
          <h2 className="text-xl font-bold text-white">{prefecture.name_ko}</h2>
          <p className="text-slate-500 text-xs mt-0.5">현청 소재지: {prefecture.capital_ko}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors text-lg leading-none mt-0.5 shrink-0"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Difficulty & Rating */}
        <div className="flex gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${cfg.bg}`}>
            {cfg.label_desc}
          </span>
          <span className="px-3 py-1 rounded-full text-yellow-400 text-xs" style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)' }}>
            관광 {starRating(prefecture.tourist_rating)}
          </span>
        </div>

        {/* Note */}
        <p className="text-slate-300 text-sm leading-relaxed rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {prefecture.note}
        </p>

        {/* Transport Score Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-medium">교통 편의도</span>
            <span className="text-sm font-bold" style={{ color: getScoreColor(prefecture.transport_score) }}>
              {prefecture.transport_score} / 10
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${prefecture.transport_score * 10}%`,
                backgroundColor: getScoreColor(prefecture.transport_score),
              }}
            />
          </div>
        </div>

        {/* Transport Types */}
        <div>
          <h3 className="text-xs text-slate-500 font-medium tracking-wider mb-2 uppercase">이용 가능 교통수단</h3>
          <div className="flex flex-wrap gap-2">
            {activeTransport.map(([key, { icon, label }]) => {
              const mapType = routeMapTypes[key] as RouteMapType | undefined;
              const hasMap = mapType && !!prefRouteMap?.[mapType];
              return hasMap ? (
                <button
                  key={key}
                  onClick={() => setRouteMapType(mapType!)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-200 transition-colors"
                  style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}
                  title={`${label} 노선도 보기`}
                >
                  {icon} {label}
                  <span className="text-indigo-400 text-[10px] leading-none">지도</span>
                </button>
              ) : (
                <span
                  key={key}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-300"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {icon} {label}
                </span>
              );
            })}
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-300"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              🚂 {jrLabels[t.jr]}
            </span>
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-300"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              🚌 {busLabels[t.bus]}
            </span>
          </div>
          {prefRouteMap && (
            <p className="text-indigo-400/50 text-[11px] mt-2">파란 배지를 클릭하면 노선도를 확인할 수 있습니다</p>
          )}
        </div>

        {/* Attractions */}
        <div>
          <h3 className="text-xs text-slate-500 font-medium tracking-wider mb-2 uppercase">주요 볼거리</h3>
          <ul className="space-y-1.5">
            {prefecture.attractions.map((a, i) => (
              <li key={i}>
                <button
                  onClick={() => setSelectedAttraction(a)}
                  className="w-full flex items-center gap-2.5 text-sm text-left px-3 py-2 rounded-lg transition-colors group"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                >
                  <span className="text-base shrink-0">{attractionIcons[a.type]}</span>
                  <span className="text-slate-200 flex-1">{a.name_ko}</span>
                  <span className="text-slate-600 text-xs shrink-0 group-hover:text-indigo-400 transition-colors">지도 →</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-slate-600 text-[11px] mt-2">볼거리를 클릭하면 Google 지도를 확인할 수 있습니다</p>
        </div>
      </div>

      {/* 노선도 모달 */}
      {routeMapType && (
        <RouteImageModal
          prefecture={prefecture}
          type={routeMapType}
          onClose={() => setRouteMapType(null)}
        />
      )}

      {/* 관광지 지도 모달 */}
      {selectedAttraction && (
        <AttractionMapModal
          attraction={selectedAttraction}
          prefecture={prefecture}
          onClose={() => setSelectedAttraction(null)}
        />
      )}
    </div>
  );
}
