import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useId } from 'react';
import type { KkImageSource } from '../../../image-source';
import { applyScheme, schemeEdge } from '../../../internal/scheme-paint';
import { KkAvatar } from '../../../KkAvatar/KkAvatar';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { kkTokens } from '../../../tokens';
import { PASS_EYEBROW, PASS_TABULAR, passRedInk } from '../pass-paint';

const { light, dark } = kkTokens.color;

export interface KkPassCastPerson {
  id: number;
  name: string;
  initials: string;
  portrait: KkImageSource | null;
  own: boolean;
}

const LIST_FRAME: CSSObject = {
  m: 0,
  p: 0,
  listStyle: 'none',
  flexWrap: 'wrap',
  gap: 0.75,
  minWidth: 0,
};

const chipPaintOf =
  (own: boolean) =>
  (theme: Theme): CSSObject => ({
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
    maxWidth: '100%',
    py: 0.375,
    pl: 0.375,
    pr: 1.25,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderRadius: `${kkTokens.radius.pill}px`,
    ...applyScheme(
      theme,
      own ? schemeEdge(light.red, dark.red) : schemeEdge(light.line, dark.line),
    ),
    ...(own ? { '& [data-kk-pass-cast-name]': passRedInk(theme) } : {}),
  });

const facePaintOf =
  (own: boolean) =>
  (theme: Theme): CSSObject => ({
    borderRadius: '50%',
    ...(own
      ? {
          outlineWidth: kkTokens.line.section,
          outlineStyle: 'solid',
          outlineOffset: 1,
          ...applyScheme(theme, {
            light: { outlineColor: light.red },
            dark: { outlineColor: dark.red },
          }),
        }
      : {}),
  });

const NAME_PAINT: CSSObject = {
  fontWeight: 700,
  lineHeight: 1.2,
  overflowWrap: 'anywhere',
};

const COUNT_PAINT: CSSObject = { ...PASS_TABULAR, color: 'text.secondary', fontWeight: 700 };

interface KkPassCardCastProps {
  label: string;
  count: string;
  people: readonly KkPassCastPerson[];
  ownLabel: string;
  emptyLabel: string;
  compact?: boolean;
}

export const KkPassCardCast: FC<KkPassCardCastProps> = ({
  label,
  count,
  people,
  ownLabel,
  emptyLabel,
  compact = false,
}) => {
  const labelId = useId();
  const chips = people.map((person) => {
    const ownNote = person.own ? <KkVisuallyHidden>{` (${ownLabel})`}</KkVisuallyHidden> : null;

    if (compact) {
      return (
        <Stack component="li" key={person.id} sx={facePaintOf(person.own)}>
          <KkAvatar initials={person.initials} image={person.portrait} size="bar" />
          <KkVisuallyHidden>
            {person.name}
            {ownNote}
          </KkVisuallyHidden>
        </Stack>
      );
    }

    return (
      <Stack component="li" direction="row" key={person.id} sx={chipPaintOf(person.own)}>
        <KkAvatar initials={person.initials} image={person.portrait} size="small" />
        <Typography component="span" variant="caption" data-kk-pass-cast-name sx={NAME_PAINT}>
          {person.name}
          {ownNote}
        </Typography>
      </Stack>
    );
  });
  const list =
    people.length === 0 ? (
      <Typography component="p" variant="caption" sx={{ m: 0, color: 'text.secondary' }}>
        {emptyLabel}
      </Typography>
    ) : (
      <Stack
        component="ul"
        direction="row"
        aria-labelledby={labelId}
        sx={[LIST_FRAME, compact && { gap: 0.5 }]}
      >
        {chips}
      </Stack>
    );

  return (
    <Stack data-kk-pass-part data-kk-pass-cast sx={{ gap: 0.75, minWidth: 0 }}>
      <Stack direction="row" sx={{ gap: 0.75, alignItems: 'baseline' }}>
        <Typography id={labelId} component="p" sx={PASS_EYEBROW}>
          {label}
        </Typography>
        <Typography component="span" variant="caption" sx={COUNT_PAINT}>
          {count}
        </Typography>
      </Stack>
      {list}
    </Stack>
  );
};
