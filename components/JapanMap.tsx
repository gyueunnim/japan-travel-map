'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { PrefectureData } from '@/types';
import { getPrefectureById } from '@/data/prefectures';
import { getScoreColor } from '@/utils/scoreColor';

interface Props {
  onSelect: (p: PrefectureData | null) => void;
  selectedId: string | null;
}

const OCEAN_COLOR     = '#5ba8c8';
const NEIGHBOR_COLOR  = '#4a6272';
const NEIGHBOR_STROKE = '#3a5060';
const PREF_STROKE     = '#1a2a38';

// 일본 GeoJSON에 맞게 프로젝션을 잡되, 여백을 주어 주변국이 보이도록 함
const PADDING = 80;

export default function JapanMap({ onSelect, selectedId }: Props) {
  const svgRef       = useRef<SVGSVGElement>(null);
  const japanRef     = useRef<any>(null);
  const worldRef     = useRef<any>(null);
  const zoomRef      = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  const render = useCallback(() => {
    if (!svgRef.current || !japanRef.current) return;

    const el     = svgRef.current;
    const width  = el.clientWidth  || 800;
    const height = el.clientHeight || 600;

    const svg = d3.select(el);
    svg.selectAll('*').remove();

    // ── SVG 필터 (그림자) ───────────────────────────────────
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'land-shadow')
      .attr('x', '-20%').attr('y', '-20%')
      .attr('width', '140%').attr('height', '140%');
    filter.append('feDropShadow')
      .attr('dx', 0).attr('dy', 2)
      .attr('stdDeviation', 4)
      .attr('flood-color', '#000')
      .attr('flood-opacity', 0.35);

    // ── 바다 (하늘색) ─────────────────────────────────────
    svg.append('rect')
      .attr('width', width).attr('height', height)
      .attr('fill', OCEAN_COLOR);

    // ── 프로젝션 — 일본에 맞게 핏, 주변 여백으로 이웃 국가 노출 ──
    const projection = d3.geoMercator()
      .fitExtent(
        [[PADDING, PADDING * 0.6], [width - PADDING, height - PADDING * 0.6]],
        japanRef.current,
      );
    const path = d3.geoPath().projection(projection);

    // ── 주변국 (클릭 불가, 배경) ─────────────────────────
    const gWorld = svg.append('g');
    if (worldRef.current) {
      gWorld.selectAll('path')
        .data((worldRef.current as GeoJSON.FeatureCollection).features)
        .enter()
        .append('path')
        .attr('d', (d: any) => path(d) ?? '')
        .attr('fill', NEIGHBOR_COLOR)
        .attr('stroke', NEIGHBOR_STROKE)
        .attr('stroke-width', 0.3)
        .style('pointer-events', 'none');
    }

    // ── 일본 도도부현 ────────────────────────────────────
    const gJapan = svg.append('g').attr('filter', 'url(#land-shadow)');

    gJapan.selectAll('path')
      .data(japanRef.current.features)
      .enter()
      .append('path')
      .attr('d', (d: any) => path(d) ?? '')
      .attr('fill', (d: any) => {
        const pref = getPrefectureById(d.properties.nam);
        return pref ? getScoreColor(pref.transport_score) : '#334155';
      })
      .attr('stroke', PREF_STROKE)
      .attr('stroke-width', 0.35)
      .attr('opacity', (d: any) =>
        selectedId && d.properties.nam !== selectedId ? 0.5 : 1,
      )
      .attr('cursor', 'pointer')
      .on('mouseenter', function (_, d: any) {
        if (d.properties.nam !== selectedId) {
          d3.select(this).attr('opacity', 1).attr('stroke', '#d1e0f0').attr('stroke-width', 1);
        }
      })
      .on('mouseleave', function (_, d: any) {
        const isSel = d.properties.nam === selectedId;
        d3.select(this)
          .attr('opacity', selectedId && !isSel ? 0.5 : 1)
          .attr('stroke', isSel ? '#ffffff' : PREF_STROKE)
          .attr('stroke-width', isSel ? 1.5 : 0.35);
      })
      .on('click', (_, d: any) => {
        const pref = getPrefectureById(d.properties.nam);
        onSelect(pref ?? null);
      });

    if (selectedId) {
      gJapan.selectAll<SVGPathElement, any>('path')
        .filter((d: any) => d.properties.nam === selectedId)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5)
        .attr('opacity', 1)
        .raise();
    }

    // ── Zoom ──────────────────────────────────────────────
    // 일본 GeoJSON의 실제 SVG 픽셀 경계를 translateExtent로 사용
    // → 어떤 줌 레벨에서도 일본이 완전히 화면 밖으로 나가지 않음
    const [[bx0, by0], [bx1, by1]] = path.bounds(japanRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 14])
      .translateExtent([[bx0, by0], [bx1, by1]])
      .on('zoom', (event) => {
        gWorld.attr('transform', event.transform.toString());
        gJapan.attr('transform', event.transform.toString());
        transformRef.current = event.transform;
      });

    zoomRef.current = zoom;
    svg.call(zoom).call(zoom.transform, transformRef.current);
  }, [onSelect, selectedId]);

  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  const handleReset = () => {
    if (!svgRef.current || !zoomRef.current) return;
    transformRef.current = d3.zoomIdentity;
    d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
  };

  useEffect(() => {
    Promise.all([
      fetch('/japan.geojson').then(r => r.json()),
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r => r.json()),
    ]).then(([japanData, worldData]) => {
      japanRef.current = japanData;
      const world = topojson.feature(worldData, worldData.objects.countries) as unknown as GeoJSON.FeatureCollection;
      // 일본(392) 제외 — 도도부현으로 별도 렌더링
      worldRef.current = {
        ...world,
        features: world.features.filter((f: any) => f.id !== '392'),
      };
      render();
    });
  }, []);

  useEffect(() => { render(); }, [selectedId, render]);

  useEffect(() => {
    const ro = new ResizeObserver(() => render());
    if (svgRef.current) ro.observe(svgRef.current);
    return () => ro.disconnect();
  }, [render]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 400 }}>
      <svg ref={svgRef} className="w-full h-full" />

      {/* 줌 컨트롤 */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
        {[
          { label: '+', title: '줌 인',   action: () => handleZoom(1.6) },
          { label: '−', title: '줌 아웃', action: () => handleZoom(1 / 1.6) },
          { label: '⌂', title: '초기화',  action: handleReset },
        ].map(({ label, title, action }) => (
          <button
            key={title}
            onClick={action}
            title={title}
            className="w-8 h-8 rounded text-white font-bold text-sm flex items-center justify-center transition-colors select-none"
            style={{ background: 'rgba(10,25,45,0.82)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="absolute bottom-4 left-4 text-xs pointer-events-none" style={{ color: 'rgba(255,255,255,0.35)' }}>
        스크롤·핀치로 줌 · 드래그로 이동
      </p>
    </div>
  );
}
