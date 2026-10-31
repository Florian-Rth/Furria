import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';

export interface KkHallAbsentPerson {
  key: number;
  number: number;
  name: string;
}

interface KkHallAbsentProps {
  title: string;
  people: readonly KkHallAbsentPerson[];
  none: string;
}

export const KkHallAbsent: FC<KkHallAbsentProps> = ({ title, people, none }) => {
  const chips = people.map((person) => (
    <Box
      component="li"
      key={person.key}
      sx={(theme) => ({
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: `${kkTokens.radius.pill}px`,
        border: `${kkTokens.line.hair}px dashed ${(theme.vars ?? theme).palette.warning.main}`,
        ...goldInkOf(theme),
      })}
    >
      <Typography variant="caption" component="span" sx={{ fontWeight: 800 }}>
        {person.number}
      </Typography>
      <Typography variant="body2" component="span" sx={{ fontWeight: 700 }}>
        {person.name}
      </Typography>
    </Box>
  ));
  const body =
    people.length === 0 ? (
      <Typography variant="body2" component="p" sx={{ color: 'text.secondary' }}>
        {none}
      </Typography>
    ) : (
      <Stack
        component="ul"
        direction="row"
        sx={{ flexWrap: 'wrap', gap: 0.75, m: 0, p: 0, listStyle: 'none' }}
      >
        {chips}
      </Stack>
    );

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0, flexWrap: 'wrap' }}>
      <Typography variant="overline" component="h2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      {body}
    </Stack>
  );
};
