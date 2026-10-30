import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkImageSource } from '../../../image-source';
import { applyScheme, schemeEdge } from '../../../internal/scheme-paint';
import { KkAvatar } from '../../../KkAvatar/KkAvatar';
import { kkTokens } from '../../../tokens';

const { light, dark } = kkTokens.color;

export interface KkPassDetailsName {
  id: number;
  name: string;
  initials: string;
  portrait: KkImageSource | null;
  meta?: string;
}

const rowPaint = (theme: Theme): CSSObject => ({
  alignItems: 'center',
  gap: 1,
  py: 0.625,
  minWidth: 0,
  '& + &': {
    borderTopWidth: kkTokens.line.hair,
    borderTopStyle: 'solid',
    ...applyScheme(theme, schemeEdge(light.line2, dark.line2)),
  },
});

const NAME_PAINT: CSSObject = { m: 0, fontWeight: 700, lineHeight: 1.25, minWidth: 0 };
const META_PAINT: CSSObject = {
  m: 0,
  ml: 'auto',
  flexShrink: 0,
  color: 'text.secondary',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
};

interface KkPassDetailsNamesProps {
  names: readonly KkPassDetailsName[];
}

export const KkPassDetailsNames: FC<KkPassDetailsNamesProps> = ({ names }) => {
  const rows = names.map((person) => {
    const meta =
      person.meta === undefined ? null : (
        <Typography component="span" variant="caption" sx={META_PAINT}>
          {person.meta}
        </Typography>
      );

    return (
      <Stack component="li" direction="row" key={person.id} sx={rowPaint}>
        <KkAvatar initials={person.initials} image={person.portrait} size="small" />
        <Typography component="span" variant="body2" sx={NAME_PAINT}>
          {person.name}
        </Typography>
        {meta}
      </Stack>
    );
  });

  return (
    <Stack component="ul" sx={{ m: 0, p: 0, listStyle: 'none', minWidth: 0 }}>
      {rows}
    </Stack>
  );
};
