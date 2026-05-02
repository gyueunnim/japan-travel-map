// 점수 1~10을 색상으로 변환 (클라이언트·서버 공통 사용)
const COLOR_STOPS: [number, [number, number, number]][] = [
  [1,  [185,  28,  28]],  // 매우 어려움 - 진빨강
  [3,  [234,  88,  12]],  // 어려움      - 주황
  [5,  [202, 138,   4]],  // 보통        - 노랑
  [7,  [ 22, 163,  74]],  // 쉬움        - 초록
  [10, [ 20,  83,  45]],  // 매우 쉬움   - 진초록
];

export function getScoreColor(score: number): string {
  const s = Math.max(1, Math.min(10, score));
  let lo = COLOR_STOPS[0];
  let hi = COLOR_STOPS[COLOR_STOPS.length - 1];
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (s >= COLOR_STOPS[i][0] && s <= COLOR_STOPS[i + 1][0]) {
      lo = COLOR_STOPS[i];
      hi = COLOR_STOPS[i + 1];
      break;
    }
  }
  const t = (s - lo[0]) / (hi[0] - lo[0]);
  const r = Math.round(lo[1][0] + t * (hi[1][0] - lo[1][0]));
  const g = Math.round(lo[1][1] + t * (hi[1][1] - lo[1][1]));
  const b = Math.round(lo[1][2] + t * (hi[1][2] - lo[1][2]));
  return `rgb(${r},${g},${b})`;
}

// 범례용 CSS 그라디언트
export const SCORE_GRADIENT =
  'linear-gradient(to right, rgb(185,28,28), rgb(234,88,12), rgb(202,138,4), rgb(22,163,74), rgb(20,83,45))';

// 점수별 라벨
export const SCORE_TICKS = [
  { score: 1,  label: '1\n매우 어려움' },
  { score: 3,  label: '3\n어려움' },
  { score: 5,  label: '5\n보통' },
  { score: 7,  label: '7\n쉬움' },
  { score: 10, label: '10\n매우 쉬움' },
];
