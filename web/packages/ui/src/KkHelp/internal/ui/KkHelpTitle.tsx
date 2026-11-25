import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { KkChip } from '../../../KkChip';
import { HELP_BADGE_SIZE, HELP_COUNTER } from '../logic/help-counter';

const badgePaint = (theme: Theme): CSSObject => ({
  '&::before': {
    content: `counter(${HELP_COUNTER})`,
    ...theme.typography.h4,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    width: HELP_BADGE_SIZE,
    height: HELP_BADGE_SIZE,
    borderRadius: '50%',
    lineHeight: 1,
    color: (theme.vars ?? theme).palette.background.paper,
    backgroundColor: (theme.vars ?? theme).palette.text.primary,
  },
});

interface KkHelpTitleProps extends PropsWithChildren {
  chip?: string;
}

export const KkHelpTitle: FC<KkHelpTitleProps> = ({ chip, children }) => {
  const chipMark = chip === undefined ? null : <KkChip size="small">{chip}</KkChip>;

  return (
    <Stack
      direction="row"
      sx={[badgePaint, { gap: 1.25, alignItems: 'center', minWidth: 0, flexWrap: 'wrap', mt: 0.5 }]}
    >
      <Typography component="h3" variant="subtitle2">
        {children}
      </Typography>
      {chipMark}
    </Stack>
  );
};
