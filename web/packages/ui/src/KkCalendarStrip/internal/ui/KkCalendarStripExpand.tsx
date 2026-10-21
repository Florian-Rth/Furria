import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { KkIcon } from '../../../KkIcon';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { calendarToolGroupPaint, calendarToolPaint } from '../../calendar-tool-paint';

const TURN = { closed: 'rotate(90deg)', open: 'rotate(-90deg)' } as const;

const expandPaint =
  (expanded: boolean) =>
  (theme: Theme): CSSObject => ({
    ...calendarToolPaint(theme),
    '& svg': {
      transform: expanded ? TURN.open : TURN.closed,
      transition: `transform ${kkTokens.calendarStrip.morphSeconds}s cubic-bezier(${kkTokens.calendarStrip.morphEase.join(', ')})`,
    },
  });

interface KkCalendarStripExpandProps {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  sx?: KkSx;
}

export const KkCalendarStripExpand: FC<KkCalendarStripExpandProps> = ({
  label,
  expanded,
  onToggle,
  sx,
}) => (
  <Stack direction="row" sx={[calendarToolGroupPaint, ...(Array.isArray(sx) ? sx : [sx])]}>
    <ButtonBase
      aria-label={label}
      aria-expanded={expanded}
      onClick={onToggle}
      data-kk-calendar-strip-expand
      sx={expandPaint(expanded)}
    >
      <KkIcon name="chevron" size="small" />
    </ButtonBase>
  </Stack>
);
