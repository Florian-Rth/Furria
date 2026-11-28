import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { kkTokens } from '../../../tokens';

const CHOICE_SHARE = '46%';

const rowPaint = (theme: Theme): CSSObject => ({
  gap: theme.spacing(0.5),
  minWidth: 0,
  padding: theme.spacing(1, 1),
  borderRadius: `${kkTokens.radius.bar * 2}px`,
});

const HEAD_FRAME: CSSObject = { alignItems: 'center', gap: 1.5, minWidth: 0 };
const NAME_PAINT: CSSObject = { flex: 1, minWidth: 0, fontWeight: 600, overflowWrap: 'anywhere' };
const NOTE_PAINT: CSSObject = { display: 'block', color: 'text.secondary', fontWeight: 600 };
const CHOICE_FRAME: CSSObject = { flex: `0 0 ${CHOICE_SHARE}`, minWidth: 0 };
const FOOT_FRAME: CSSObject = {
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 1,
  minWidth: 0,
};
const TRAIL_PAINT: CSSObject = {
  flex: 1,
  minWidth: 0,
  color: 'text.secondary',
  overflowWrap: 'anywhere',
};

interface KkNamesSheetChoiceRowProps extends PropsWithChildren {
  name: string;
  note?: string;
  trail?: string;
  action?: ReactNode;
}

export const KkNamesSheetChoiceRow: FC<KkNamesSheetChoiceRowProps> = ({
  name,
  note,
  trail,
  action,
  children,
}) => {
  const noteLine =
    note === undefined ? null : (
      <Typography component="span" variant="caption" sx={NOTE_PAINT}>
        {note}
      </Typography>
    );
  const trailLine =
    trail === undefined ? null : (
      <Typography component="p" variant="caption" sx={TRAIL_PAINT}>
        {trail}
      </Typography>
    );
  const hasFoot = trail !== undefined || action !== undefined;
  const footLine = hasFoot ? (
    <Stack direction="row" sx={FOOT_FRAME}>
      {trailLine}
      {action}
    </Stack>
  ) : null;

  return (
    <Stack component="li" data-kk-names-sheet-choice-row sx={rowPaint}>
      <Stack direction="row" sx={HEAD_FRAME}>
        <Typography component="span" variant="body2" sx={NAME_PAINT}>
          {name}
          {noteLine}
        </Typography>
        <Box sx={CHOICE_FRAME}>{children}</Box>
      </Stack>
      {footLine}
    </Stack>
  );
};
