export type Difficulty = 'easy' | 'medium' | 'hard';
export type JRCoverage = 'extensive' | 'good' | 'limited' | 'minimal';
export type BusCoverage = 'good' | 'limited' | 'minimal';
export type AttractionType = 'UNESCO' | 'nature' | 'cultural' | 'food' | 'onsen' | 'history' | 'theme_park';

export interface TransportInfo {
  subway: boolean;
  tram: boolean;
  jr: JRCoverage;
  bus: BusCoverage;
  touristBus: boolean;
  monorail: boolean;
  shinkansen: boolean;
  localRailway: boolean;
}

export interface Attraction {
  name_ko: string;  // 한국어명 (주표시)
  name_ja: string;  // 일본어 원문 (참고)
  type: AttractionType;
}

export interface PrefectureData {
  id: string;           // GeoJSON 'nam' 속성과 일치
  name_ko: string;      // 한국어명 (주표시)
  name_ja: string;      // 일본어 원문
  name_en: string;      // 영문명
  capital_ko: string;   // 한국어 현청 소재지
  capital_ja: string;   // 일본어 현청 소재지
  difficulty: Difficulty;
  transport_score: number; // 1–10
  tourist_rating: number;  // 1–5
  transport: TransportInfo;
  attractions: Attraction[];
  note: string;            // 교통 설명 (한국어)
}
