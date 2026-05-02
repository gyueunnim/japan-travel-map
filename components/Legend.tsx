import { SCORE_GRADIENT, getScoreColor } from '@/utils/scoreColor';

const TICKS = [
  { score: 1,  label: '매우 어려움' },
  { score: 3,  label: '어려움' },
  { score: 5,  label: '보통' },
  { score: 7,  label: '쉬움' },
  { score: 10, label: '매우 쉬움' },
];

export default function Legend() {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-xs text-slate-400">교통 편의 점수 (1 → 10)</span>

      {/* Gradient bar */}
      <div
        className="h-3 rounded-full w-48 sm:w-56"
        style={{ background: SCORE_GRADIENT }}
      />

      {/* Tick labels */}
      <div className="flex justify-between w-48 sm:w-56">
        {TICKS.map(({ score, label }) => (
          <div key={score} className="flex flex-col items-center gap-0.5">
            <span
              className="text-[10px] font-bold"
              style={{ color: getScoreColor(score) }}
            >
              {score}
            </span>
            <span className="text-[9px] text-slate-500 whitespace-nowrap">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
