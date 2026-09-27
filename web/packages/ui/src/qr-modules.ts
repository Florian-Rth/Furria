import { encode } from 'uqr';

export interface KkQrModules {
  size: number;
  path: string;
}

const QUIET_ZONE = 2;

export const toQrPath = (modules: readonly (readonly boolean[])[]): string =>
  modules
    .flatMap((row, y) => row.map((isDark, x) => (isDark ? `M${x} ${y}h1v1h-1z` : '')))
    .join('');

export const toQrModules = (value: string): KkQrModules => {
  const { data, size } = encode(value, { ecc: 'M', border: QUIET_ZONE });

  return { size, path: toQrPath(data) };
};
