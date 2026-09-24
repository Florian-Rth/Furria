import type { KkScreenOrigin } from '@furria/ui';

export const toOriginHref = (origin: KkScreenOrigin): string => {
  const params = origin.params ?? {};

  return Object.entries(params).reduce(
    (path, [name, value]) => path.replace(`$${name}`, value),
    origin.to,
  );
};
