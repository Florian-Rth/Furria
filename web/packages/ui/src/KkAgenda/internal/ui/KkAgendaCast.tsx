import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

export interface KkAgendaCastName {
  id: number;
  name: string;
  own: boolean;
}

const LIST_PAINT: CSSObject = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(9.5rem, 1fr))',
  columnGap: 2,
  m: 0,
  p: 0,
  listStyle: 'none',
  minWidth: 0,
};

const namePaint =
  (own: boolean) =>
  (theme: Theme): CSSObject => ({
    py: 0.5,
    minWidth: 0,
    fontWeight: own ? 800 : 600,
    lineHeight: 1.35,
    borderBottomWidth: kkTokens.line.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: 'divider',
    ...(own ? redInk(theme) : {}),
  });

interface KkAgendaCastProps {
  label: string;
  names: readonly KkAgendaCastName[];
  ownSuffix: string;
}

export const KkAgendaCast: FC<KkAgendaCastProps> = ({ label, names, ownSuffix }) => {
  const items = names.map((person) => (
    <Typography key={person.id} component="li" variant="body2" sx={namePaint(person.own)}>
      {person.own ? `${person.name}${ownSuffix}` : person.name}
    </Typography>
  ));

  return (
    <Box component="ul" aria-label={label} data-kk-agenda-cast sx={LIST_PAINT}>
      {items}
    </Box>
  );
};
