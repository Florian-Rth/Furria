import type { KkScreenOrigin } from '@furria/ui/screen-declaration';

const queryOf = (search: Record<string, string> | undefined): string => {
  const query = new URLSearchParams(search).toString();

  return query === '' ? '' : `?${query}`;
};

export const toOriginHref = (origin: KkScreenOrigin): string => {
  const params = origin.params ?? {};
  const path = Object.entries(params).reduce(
    (resolved, [name, value]) => resolved.replace(`$${name}`, value),
    origin.to,
  );

  return `${path}${queryOf(origin.search)}`;
};
