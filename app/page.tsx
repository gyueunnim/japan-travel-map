'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { PrefectureData } from '@/types';
import PrefecturePanel from '@/components/PrefecturePanel';
import Legend from '@/components/Legend';

const JapanMap = dynamic(() => import('@/components/JapanMap'), { ssr: false });

export default function Home() {
  const [selected, setSelected] = useState<PrefectureData | null>(null);

  return (
    <div
      className="h-screen text-white flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0f1f3d 0%, #0d1728 55%, #101f38 100%)' }}
    >
      {/* Header */}
      <header
        className="shrink-0 px-4 py-2.5 flex items-center justify-between gap-3"
        style={{
          background: 'rgba(10,20,40,0.88)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="min-w-0">
          <h1 className="text-sm font-bold tracking-wide text-white/90 whitespace-nowrap">
            🗾 일본 여행 교통 난이도 지도
          </h1>
          <p className="text-slate-500 text-[11px] mt-0.5 hidden sm:block">
            도도부현을 클릭하면 교통편 및 볼거리 정보를 확인할 수 있습니다
          </p>
        </div>
        {/* 레전드는 sm 이상에서만 표시 */}
        <div className="hidden sm:block shrink-0">
          <Legend />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 relative overflow-hidden md:flex md:flex-row md:p-3 md:gap-3">
        {/* Map — 모바일: 전체 화면, 데스크탑: flex-1 카드 */}
        <div
          className="absolute inset-0 md:relative md:inset-auto md:flex-1 md:rounded-2xl overflow-hidden"
          style={{
            background: '#091929',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <JapanMap onSelect={setSelected} selectedId={selected?.id ?? null} />
        </div>

        {/* 모바일: 선택 시 밑에서 올라오는 바텀 시트 */}
        {selected && (
          <div
            className="md:hidden absolute inset-0 z-10"
            style={{ background: 'rgba(0,0,0,0.35)' }}
            onClick={() => setSelected(null)}
          />
        )}

        {/* Panel — 모바일: 바텀 시트, 데스크탑: 사이드 패널 */}
        <aside
          className={[
            // 공통
            'overflow-y-auto z-20',
            // 모바일: 화면 하단에 고정, 위아래 슬라이드
            'absolute bottom-0 left-0 right-0 rounded-t-2xl max-h-[78vh]',
            'transition-transform duration-300 ease-out',
            selected ? 'translate-y-0' : 'translate-y-full',
            // 데스크탑: 사이드 패널
            'md:relative md:inset-auto md:translate-y-0 md:max-h-none',
            'md:w-80 lg:w-96 md:shrink-0 md:rounded-2xl',
          ].join(' ')}
          style={{
            background: 'rgba(14,28,52,0.97)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {/* 모바일 드래그 핸들 */}
          <div className="md:hidden flex justify-center pt-2.5 pb-0.5 shrink-0">
            <div className="w-9 h-1 rounded-full bg-slate-600" />
          </div>

          <PrefecturePanel
            prefecture={selected}
            onClose={() => setSelected(null)}
          />
        </aside>
      </main>

      {/* Footer — 데스크탑만 표시 */}
      <footer
        className="hidden md:block shrink-0 text-center py-1.5 px-4"
        style={{ color: 'rgba(148,163,184,0.28)', fontSize: '11px' }}
      >
        데이터: dataofjapan/land (GeoJSON) · 교통·관광 정보는 대표 관광 거점 기준 참고용입니다
      </footer>
    </div>
  );
}
