export interface RouteMapInfo {
  label: string;
  wikiArticle: string;  // Wikipedia REST API article title
  officialUrl: string;
  officialLabel: string;
}

export type RouteMapType = 'subway' | 'tram' | 'monorail';

export const ROUTE_MAP_DATA: Record<string, Partial<Record<RouteMapType, RouteMapInfo>>> = {
  'Hokkai Do': {
    subway: { label: '삿포로 시영 지하철', wikiArticle: 'Sapporo_Municipal_Subway', officialUrl: 'https://www.city.sapporo.jp/st/', officialLabel: '삿포로 시 교통국' },
    tram:   { label: '삿포로 시 노면전차', wikiArticle: 'Sapporo_City_Tram',         officialUrl: 'https://www.city.sapporo.jp/st/',  officialLabel: '삿포로 시 교통국' },
  },
  'Miyagi Ken': {
    subway: { label: '센다이 시 지하철', wikiArticle: 'Sendai_City_Subway', officialUrl: 'https://www.kotsu.city.sendai.jp/subway/', officialLabel: '센다이 시 교통국' },
  },
  'Saitama Ken': {
    subway: { label: '사이타마 고속철도', wikiArticle: 'Saitama_Railway', officialUrl: 'https://www.s-railway.co.jp/', officialLabel: '사이타마 고속철도' },
  },
  'Chiba Ken': {
    monorail: { label: '지바 도시 모노레일', wikiArticle: 'Chiba_Urban_Monorail', officialUrl: 'https://www.chiba-monorail.co.jp/', officialLabel: '지바 도시 모노레일' },
  },
  'Tokyo To': {
    subway: { label: '도쿄 지하철 (메트로·도영)', wikiArticle: 'Tokyo_Metro', officialUrl: 'https://www.tokyometro.jp/en/subwaymap/', officialLabel: 'Tokyo Metro 공식 노선도' },
  },
  'Kanagawa Ken': {
    subway: { label: '요코하마 시 지하철', wikiArticle: 'Yokohama_Municipal_Subway', officialUrl: 'https://www.city.yokohama.lg.jp/kotsu/subway/rosenzu.html', officialLabel: '요코하마 시 교통국' },
  },
  'Toyama Ken': {
    tram: { label: '도야마 LRT', wikiArticle: 'Toyama_Light_Rail', officialUrl: 'https://www.chitetsu.co.jp/', officialLabel: '도야마 지방 철도' },
  },
  'Aichi Ken': {
    subway: { label: '나고야 시 지하철', wikiArticle: 'Nagoya_Municipal_Subway', officialUrl: 'https://www.kotsu.city.nagoya.jp/', officialLabel: '나고야 시 교통국' },
  },
  'Kyoto Fu': {
    subway: { label: '교토 시 지하철', wikiArticle: 'Kyoto_Municipal_Subway', officialUrl: 'https://www.city.kyoto.lg.jp/kotsu/page/0000024700.html', officialLabel: '교토 시 교통국' },
  },
  'Osaka Fu': {
    subway:   { label: '오사카 메트로', wikiArticle: 'Osaka_Metro', officialUrl: 'https://subway.osakametro.co.jp/en/', officialLabel: '오사카 메트로 공식 사이트' },
    monorail: { label: '오사카 모노레일', wikiArticle: 'Osaka_Monorail', officialUrl: 'https://www.osaka-monorail.co.jp/', officialLabel: '오사카 모노레일' },
  },
  'Hyogo Ken': {
    subway: { label: '고베 시 지하철', wikiArticle: 'Kobe_Municipal_Subway', officialUrl: 'https://www.city.kobe.lg.jp/a56856/shise/toshi/kobe_subway/', officialLabel: '고베 시 교통국' },
  },
  'Okayama Ken': {
    tram: { label: '오카야마 전기철도', wikiArticle: 'Okayama_Electric_Tramway', officialUrl: 'https://www.okayama-kido.co.jp/tramway/', officialLabel: '오카야마 기도 교통' },
  },
  'Hiroshima Ken': {
    tram: { label: '히로시마 전철', wikiArticle: 'Hiroshima_Electric_Railway', officialUrl: 'https://www.hiroden.co.jp/train/route-map/', officialLabel: '히로시마 전철 노선도' },
  },
  'Ehime Ken': {
    tram: { label: '이요 철도 (마쓰야마)', wikiArticle: 'Iyo_Railway', officialUrl: 'https://www.iyotetsu.co.jp/', officialLabel: '이요 철도' },
  },
  'Kochi Ken': {
    tram: { label: '도사 전철', wikiArticle: 'Tosa_Electric_Railway', officialUrl: 'https://www.tosaden.co.jp/', officialLabel: '도사 전철' },
  },
  'Fukuoka Ken': {
    subway: { label: '후쿠오카 시 지하철', wikiArticle: 'Fukuoka_City_Subway', officialUrl: 'https://subway.city.fukuoka.lg.jp/', officialLabel: '후쿠오카 시 지하철' },
  },
  'Nagasaki Ken': {
    tram: { label: '나가사키 전기철도', wikiArticle: 'Nagasaki_Electric_Tramway', officialUrl: 'https://www.naga-den.com/publics/index/29/', officialLabel: '나가사키 전기 궤도' },
  },
  'Kumamoto Ken': {
    tram: { label: '구마모토 시 전차', wikiArticle: 'Kumamoto_City_Tram', officialUrl: 'https://www.kotsu.city.kumamoto.jp/', officialLabel: '구마모토 시 교통국' },
  },
  'Kagoshima Ken': {
    tram: { label: '가고시마 시 전차', wikiArticle: 'Kagoshima_City_Tram', officialUrl: 'https://www.kotsu-city-kagoshima.jp/', officialLabel: '가고시마 시 교통국' },
  },
  'Okinawa Ken': {
    monorail: { label: '오키나와 모노레일 (유이레일)', wikiArticle: 'Okinawa_Monorail', officialUrl: 'https://www.yui-rail.co.jp/', officialLabel: '오키나와 도시 모노레일' },
  },
};
