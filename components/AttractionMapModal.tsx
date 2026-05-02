'use client';

import { Attraction, PrefectureData } from '@/types';

interface Props {
  attraction: Attraction;
  prefecture: PrefectureData;
  onClose: () => void;
}

const attractionTypeLabel: Record<string, string> = {
  UNESCO:     'UNESCO 세계유산',
  nature:     '자연',
  cultural:   '문화·예술',
  food:       '음식·미식',
  onsen:      '온천',
  history:    '역사·신사',
  theme_park: '테마파크',
};

export default function AttractionMapModal({ attraction, prefecture, onClose }: Props) {
  // 일본어명 + 현 이름으로 검색 정확도 향상
  const query = encodeURIComponent(`${attraction.name_ja} ${prefecture.name_ja}`);
  const mapUrl = `https://maps.google.com/maps?q=${query}&output=embed&hl=ko&z=14`;
  const mapsLink = `https://maps.google.com/maps?q=${query}&hl=ko`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="border border-slate-600/50 rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl"
        style={{ background: '#0e1c30', height: '82vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/60 shrink-0">
          <div>
            <h2 className="text-white font-bold text-base">{attraction.name_ko}</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {attractionTypeLabel[attraction.type] ?? attraction.type} · {prefecture.name_ko}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4 shrink-0">
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors hidden sm:block"
            >
              Google 지도에서 열기 →
            </a>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">
              ✕
            </button>
          </div>
        </div>

        {/* Map iframe */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={mapUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${attraction.name_ko} 지도`}
          />
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-2 border-t border-slate-700/60 flex items-center justify-between">
          <p className="text-slate-600 text-xs">지도 데이터: Google Maps</p>
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors sm:hidden"
          >
            Google 지도에서 열기 →
          </a>
        </div>
      </div>
    </div>
  );
}
