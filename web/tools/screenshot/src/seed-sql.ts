import type { IsoDay } from './seed-time.ts';

export interface SqlTweak {
  readonly why: string;
  readonly statements: readonly string[];
}

export const sqlText = (value: string): string => `'${value.replaceAll("'", "''")}'`;

export const sqlInstant = (instant: Date): string =>
  `${sqlText(instant.toISOString())}::timestamptz`;

export const sqlDay = (day: IsoDay): string => `${sqlText(day)}::date`;

export const sqlScriptOf = (tweaks: readonly SqlTweak[]): string =>
  [
    '\\set ON_ERROR_STOP on',
    'BEGIN;',
    ...tweaks.flatMap((tweak) => [`\\echo ${sqlText(tweak.why)}`, ...tweak.statements]),
    'COMMIT;',
    '',
  ].join('\n');
