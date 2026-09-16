export type KkLinkSearchValues = Record<string, string | number>;

export type KkLinkSearch =
  | KkLinkSearchValues
  | ((previous: KkLinkSearchValues) => KkLinkSearchValues);
