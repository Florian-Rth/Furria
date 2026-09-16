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
}

interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

const VIEWPORTS: Record<ShotViewport, ViewportSize> = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1400, height: 900 },
};

const SCHEMES: readonly ShotScheme[] = ['light', 'dark'];

export const DEFAULT_BASE_URL = 'http://localhost:3001';
export const DEFAULT_OUT_DIR = 'out';

export const deriveShotName = (route: string): string => {
  const slug = route
    .split(/[/?#=&]/)
    .filter((segment) => segment.length > 0)
    .join('-')
    .toLowerCase();
  return slug.length > 0 ? slug : 'home';
};

export const buildShotVariants = (name: string): ShotVariant[] =>
  (Object.keys(VIEWPORTS) as ShotViewport[]).flatMap((viewport) =>
    SCHEMES.map((scheme) => ({
      viewport,
      scheme,
      width: VIEWPORTS[viewport].width,
      height: VIEWPORTS[viewport].height,
      fileName: `${name}-${viewport}-${scheme}.png`,
    })),
  );

const readOptionValue = (argv: readonly string[], index: number, option: string): string => {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${option} needs a value`);
  }
  return value;
};

export const parseShotArgs = (argv: readonly string[]): ShotRequest => {
  let route: string | null = null;
  let name: string | null = null;
  let outDir = DEFAULT_OUT_DIR;
  let baseUrl = DEFAULT_BASE_URL;
  let login = true;

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
    } else if (argument === '--no-login') {
      login = false;
    } else if (argument.startsWith('--')) {
      throw new Error(`unknown option ${argument}`);
    } else if (route === null) {
      route = argument;
    } else {
      throw new Error(`unexpected argument ${argument}`);
    }
  }

  if (route === null) {
    throw new Error(
      'usage: pnpm shot <route> [--name <name>] [--out <dir>] [--base <url>] [--no-login]',
    );
  }

  return {
    route,
    name: name ?? deriveShotName(route),
    outDir,
    baseUrl: baseUrl.replace(/\/$/, ''),
    login,
  };
};
