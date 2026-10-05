export type ShotViewport = 'phone' | 'desktop';
export type ShotScheme = 'light' | 'dark';

export interface ShotVariant {
  readonly viewport: ShotViewport;
  readonly scheme: ShotScheme;
  readonly width: number;
  readonly height: number;
  readonly fileName: string;
}

export interface ShotRequest {
  readonly route: string;
  readonly name: string;
  readonly outDir: string;
  readonly baseUrl: string;
  readonly login: boolean;
  readonly reducedMotion: boolean;
  readonly textScale: number | null;
  readonly filmstrip: boolean;
  readonly viewports: readonly ShotViewport[];
  readonly schemes: readonly ShotScheme[];
  readonly clicks: readonly string[];
}

export interface TimedFrame {
  readonly at: number;
}

interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

const VIEWPORTS: Record<ShotViewport, ViewportSize> = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1400, height: 900 },
};

const ALL_VIEWPORTS: readonly ShotViewport[] = ['phone', 'desktop'];
const ALL_SCHEMES: readonly ShotScheme[] = ['light', 'dark'];
const FILMSTRIP_VIEWPORTS: readonly ShotViewport[] = ['phone'];
const FILMSTRIP_SCHEMES: readonly ShotScheme[] = ['light'];
const OFFSET_DIGITS = 4;

export const DEFAULT_BASE_URL = 'http://localhost:3001';
export const DEFAULT_OUT_DIR = 'out';
export const FILMSTRIP_OFFSETS_MS: readonly number[] = [
  0, 120, 240, 360, 480, 640, 800, 1000, 1400,
];

const USAGE =
  'usage: pnpm shot <route> [--name <name>] [--out <dir>] [--base <url>] [--no-login] ' +
  '[--reduced-motion] [--text-scale <factor>] [--filmstrip] [--viewport phone|desktop] ' +
  '[--scheme light|dark] [--click <selector>]...';

export const deriveShotName = (route: string): string => {
  const slug = route
    .split(/[/?#=&]/)
    .filter((segment) => segment.length > 0)
    .join('-')
    .toLowerCase();
  return slug.length > 0 ? slug : 'home';
};

export const buildShotVariants = (
  name: string,
  viewports: readonly ShotViewport[] = ALL_VIEWPORTS,
  schemes: readonly ShotScheme[] = ALL_SCHEMES,
): ShotVariant[] =>
  ALL_VIEWPORTS.filter((viewport) => viewports.includes(viewport)).flatMap((viewport) =>
    ALL_SCHEMES.filter((scheme) => schemes.includes(scheme)).map((scheme) => ({
      viewport,
      scheme,
      width: VIEWPORTS[viewport].width,
      height: VIEWPORTS[viewport].height,
      fileName: `${name}-${viewport}-${scheme}.png`,
    })),
  );

export const filmstripFrameFileName = (name: string, offsetMs: number): string =>
  `${name}-filmstrip-${String(offsetMs).padStart(OFFSET_DIGITS, '0')}ms.png`;

export const filmstripSheetFileName = (name: string): string => `${name}-filmstrip.png`;

export const pickFilmstripFrames = <TFrame extends TimedFrame>(
  frames: readonly TFrame[],
  startAt: number,
  offsets: readonly number[],
): (TFrame | null)[] => {
  const earliest = frames.reduce<TFrame | null>(
    (first, frame) => (first === null || frame.at < first.at ? frame : first),
    null,
  );
  return offsets.map((offset) => {
    const dueAt = startAt + offset;
    const shown = frames.reduce<TFrame | null>(
      (latest, frame) =>
        frame.at <= dueAt && (latest === null || frame.at >= latest.at) ? frame : latest,
      null,
    );
    return shown ?? earliest;
  });
};

const readOptionValue = (argv: readonly string[], index: number, option: string): string => {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${option} needs a value`);
  }
  return value;
};

const parseTextScale = (value: string): number => {
  const scale = Number(value);
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error(`--text-scale needs a positive factor, got ${value}`);
  }
  return scale;
};

const parseViewport = (value: string): ShotViewport => {
  const viewport = ALL_VIEWPORTS.find((candidate) => candidate === value);
  if (viewport === undefined) {
    throw new Error(`--viewport is phone or desktop, got ${value}`);
  }
  return viewport;
};

const parseScheme = (value: string): ShotScheme => {
  const scheme = ALL_SCHEMES.find((candidate) => candidate === value);
  if (scheme === undefined) {
    throw new Error(`--scheme is light or dark, got ${value}`);
  }
  return scheme;
};

const selectedOr = <TValue>(
  selected: readonly TValue[],
  fallback: readonly TValue[],
): readonly TValue[] => (selected.length > 0 ? selected : fallback);

export const parseShotArgs = (argv: readonly string[]): ShotRequest => {
  let route: string | null = null;
  let name: string | null = null;
  let outDir = DEFAULT_OUT_DIR;
  let baseUrl = DEFAULT_BASE_URL;
  let login = true;
  let reducedMotion = false;
  let textScale: number | null = null;
  let filmstrip = false;
  const viewports: ShotViewport[] = [];
  const schemes: ShotScheme[] = [];
  const clicks: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === undefined || argument === '--') {
      continue;
    }
    if (argument === '--name') {
      name = readOptionValue(argv, index, argument);
      index += 1;
    } else if (argument === '--out') {
      outDir = readOptionValue(argv, index, argument);
      index += 1;
    } else if (argument === '--base') {
      baseUrl = readOptionValue(argv, index, argument);
      index += 1;
    } else if (argument === '--text-scale') {
      textScale = parseTextScale(readOptionValue(argv, index, argument));
      index += 1;
    } else if (argument === '--viewport') {
      viewports.push(parseViewport(readOptionValue(argv, index, argument)));
      index += 1;
    } else if (argument === '--scheme') {
      schemes.push(parseScheme(readOptionValue(argv, index, argument)));
      index += 1;
    } else if (argument === '--click') {
      clicks.push(readOptionValue(argv, index, argument));
      index += 1;
    } else if (argument === '--no-login') {
      login = false;
    } else if (argument === '--reduced-motion') {
      reducedMotion = true;
    } else if (argument === '--filmstrip') {
      filmstrip = true;
    } else if (argument.startsWith('--')) {
      throw new Error(`unknown option ${argument}`);
    } else if (route === null) {
      route = argument;
    } else {
      throw new Error(`unexpected argument ${argument}`);
    }
  }

  if (route === null) {
    throw new Error(USAGE);
  }
  if (filmstrip && reducedMotion) {
    throw new Error('--filmstrip records the motion, so it cannot run with --reduced-motion');
  }

  return {
    route,
    name: name ?? deriveShotName(route),
    outDir,
    baseUrl: baseUrl.replace(/\/$/, ''),
    login,
    reducedMotion,
    textScale,
    filmstrip,
    viewports: selectedOr(viewports, filmstrip ? FILMSTRIP_VIEWPORTS : ALL_VIEWPORTS),
    schemes: selectedOr(schemes, filmstrip ? FILMSTRIP_SCHEMES : ALL_SCHEMES),
    clicks,
  };
};
