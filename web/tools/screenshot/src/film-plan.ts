import path from 'node:path';

export const FILM_VIEWPORTS = {
  phone: { width: 390, height: 844 },
  landscape: { width: 844, height: 390 },
  tablet: { width: 1180, height: 820 },
} as const;

export type FilmViewport = keyof typeof FILM_VIEWPORTS;

export interface FilmRequest {
  readonly route: string;
  readonly scriptPath: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly login: boolean;
  readonly viewport: FilmViewport;
}

const DEFAULT_BASE_URL = 'http://localhost:3001';
const DEFAULT_VIEWPORT: FilmViewport = 'phone';

const USAGE =
  'usage: pnpm film <route> --script <gestures.json> [--name <name>] [--base <url>] ' +
  '[--no-login] [--viewport phone|landscape|tablet]';

const isViewport = (value: string): value is FilmViewport => Object.hasOwn(FILM_VIEWPORTS, value);

const isFlag = (value: string): boolean => value.startsWith('--');

const optionOf = (args: readonly string[], flag: string): string | undefined => {
  const index = args.indexOf(flag);
  const value = index < 0 ? undefined : args[index + 1];
  if (index >= 0 && (value === undefined || isFlag(value))) {
    throw new Error(`${flag} needs a value\n${USAGE}`);
  }

  return value;
};

export const parseFilmArgs = (args: readonly string[]): FilmRequest => {
  const [route, ...rest] = args;
  const scriptPath = optionOf(rest, '--script');
  const viewport = optionOf(rest, '--viewport') ?? DEFAULT_VIEWPORT;
  if (route === undefined || isFlag(route) || scriptPath === undefined || !isViewport(viewport)) {
    throw new Error(USAGE);
  }

  return {
    route,
    scriptPath,
    name: optionOf(rest, '--name') ?? path.parse(scriptPath).name,
    baseUrl: optionOf(rest, '--base') ?? DEFAULT_BASE_URL,
    login: !rest.includes('--no-login'),
    viewport,
  };
};
