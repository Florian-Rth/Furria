export const brand = {
  tileTop: '#E11D2A',
  tileBottom: '#B3101C',
  broom: '#FFFFFF',
  band: '#9C0B22',
  splashLight: '#F1F2F4',
  splashDark: '#101216',
} as const;

export const TILE_VIEW_BOX = 300;
export const SPLASH_VIEW_BOX = 2732;
export const SQUIRCLE_RADIUS_RATIO = 0.225;

const BROOM_SCALE = 2.05;
const BROOM_HANDLE_LENGTH = 66;
const BROOM_ROTATIONS = [-122, 122];
const BRISTLE_TEXTURE_LINES = 8;
const ADAPTIVE_SAFE_ZONE_SCALE = 0.86;
const SPLASH_TILE_SIZE = 900;

const bristleTexture = Array.from({ length: BRISTLE_TEXTURE_LINES }, (_line, index) => {
  const ratio = index / (BRISTLE_TEXTURE_LINES - 1);
  const top = -8 + 16 * ratio;
  const bottom = -21 + 42 * ratio;
  return `<line x1="${top}" y1="7" x2="${bottom}" y2="47" stroke="${brand.band}" stroke-opacity="0.28" stroke-width="1.1" />`;
}).join('');

const broom = (
  rotation: number,
): string => `<g transform="rotate(${rotation}) scale(${BROOM_SCALE})">
    <rect x="-2.6" y="${-BROOM_HANDLE_LENGTH}" width="5.2" height="${BROOM_HANDLE_LENGTH}" rx="2.6" fill="${brand.broom}" />
    <circle cx="0" cy="${-BROOM_HANDLE_LENGTH}" r="4.1" fill="${brand.broom}" />
    <path d="M-8.5,6 L-21,48 Q0,53 21,48 L8.5,6 Z" fill="${brand.broom}" />
    ${bristleTexture}
    <rect x="-9.5" y="-5" width="19" height="12" rx="3" fill="${brand.band}" />
    <rect x="-9.5" y="-5" width="19" height="4" rx="2" fill="#FFFFFF" fill-opacity="0.18" />
  </g>`;

const crossedBrooms = BROOM_ROTATIONS.map(broom).join('');

const tileGradient = `<linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${brand.tileTop}" />
    <stop offset="1" stop-color="${brand.tileBottom}" />
  </linearGradient>`;

const tileCentre = TILE_VIEW_BOX / 2;

export const iconOnlySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE_VIEW_BOX} ${TILE_VIEW_BOX}">
  <defs>${tileGradient}</defs>
  <rect width="${TILE_VIEW_BOX}" height="${TILE_VIEW_BOX}" fill="url(#tile)" />
  <g transform="translate(${tileCentre} ${tileCentre})">${crossedBrooms}</g>
</svg>`;

export const iconBackgroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE_VIEW_BOX} ${TILE_VIEW_BOX}">
  <defs>${tileGradient}</defs>
  <rect width="${TILE_VIEW_BOX}" height="${TILE_VIEW_BOX}" fill="url(#tile)" />
</svg>`;

export const iconForegroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE_VIEW_BOX} ${TILE_VIEW_BOX}">
  <g transform="translate(${tileCentre} ${tileCentre}) scale(${ADAPTIVE_SAFE_ZONE_SCALE})">${crossedBrooms}</g>
</svg>`;

const splashTileOffset = (SPLASH_VIEW_BOX - SPLASH_TILE_SIZE) / 2;
const splashCentre = SPLASH_VIEW_BOX / 2;

export const splashSvg = (
  background: string,
): string => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SPLASH_VIEW_BOX} ${SPLASH_VIEW_BOX}">
  <defs>
    ${tileGradient}
    <clipPath id="squircle">
      <rect x="${splashTileOffset}" y="${splashTileOffset}" width="${SPLASH_TILE_SIZE}" height="${SPLASH_TILE_SIZE}" rx="${SPLASH_TILE_SIZE * SQUIRCLE_RADIUS_RATIO}" />
    </clipPath>
  </defs>
  <rect width="${SPLASH_VIEW_BOX}" height="${SPLASH_VIEW_BOX}" fill="${background}" />
  <g clip-path="url(#squircle)">
    <rect x="${splashTileOffset}" y="${splashTileOffset}" width="${SPLASH_TILE_SIZE}" height="${SPLASH_TILE_SIZE}" fill="url(#tile)" />
    <g transform="translate(${splashCentre} ${splashCentre}) scale(${SPLASH_TILE_SIZE / TILE_VIEW_BOX})">${crossedBrooms}</g>
  </g>
</svg>`;
