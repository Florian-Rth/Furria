import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkAnswerRollName } from '../answer-roll-name';

const NAMES_INDENT = 2;
const NAME_SEPARATOR = '","';

interface KkAnswerRollNamesProps {
  names: readonly KkAnswerRollName[];
}

export const KkAnswerRollNames: FC<KkAnswerRollNamesProps> = ({ names }) => {
  const items = names.map((name) => {
    const note =
      name.note === undefined ? null : (
        <Box component="span" data-kk-answer-roll-note sx={{ color: 'text.secondary', ml: 0.5 }}>
          {name.note}
        </Box>
      );

    return (
      <Typography
        key={name.key}
        component="li"
        variant="caption"
        sx={{
          color: 'text.primary',
          overflowWrap: 'anywhere',
          '&:not(:last-of-type)::after': { content: NAME_SEPARATOR, color: 'text.secondary' },
        }}
      >
        {name.text}
        {note}
      </Typography>
    );
  });

  return (
    <Stack
      component="ul"
      direction="row"
      data-kk-answer-roll-names
      sx={{
        flexWrap: 'wrap',
        columnGap: 0.5,
        minWidth: 0,
        m: 0,
        p: 0,
        pl: NAMES_INDENT,
        listStyle: 'none',
      }}
    >
      {items}
    </Stack>
  );
};
