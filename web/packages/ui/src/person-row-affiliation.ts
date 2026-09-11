export interface KkPersonRowAffiliationInput {
  accent?: string;
  meta?: string;
  emptyMeta?: string;
}

export interface KkPersonRowAffiliation {
  accent: string | null;
  meta: string | null;
  empty: string | null;
  present: boolean;
}

const SEPARATOR = ' · ';

const toFilled = (value: string | undefined): string | null => {
  if (value === undefined) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
};

export const resolvePersonRowAffiliation = ({
  accent,
  meta,
  emptyMeta,
}: KkPersonRowAffiliationInput): KkPersonRowAffiliation => {
  const filledAccent = toFilled(accent);
  const filledMeta = toFilled(meta);

  if (filledAccent === null && filledMeta === null) {
    const empty = toFilled(emptyMeta);

    return { accent: null, meta: null, empty, present: empty !== null };
  }

  if (filledAccent === null) {
    return { accent: null, meta: filledMeta, empty: null, present: true };
  }

  if (filledMeta === null) {
    return { accent: filledAccent, meta: null, empty: null, present: true };
  }

  return {
    accent: filledAccent,
    meta: `${SEPARATOR}${filledMeta}`,
    empty: null,
    present: true,
  };
};
