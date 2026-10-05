import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkStampTone } from './KkDensePanelStampEyebrow';
import { KkDensePanelStampEyebrow } from './KkDensePanelStampEyebrow';

const NO_EYEBROW = '';

const STAMP_FRAME: CSSObject = { minWidth: 0, maxWidth: '100%' };

const TIME_PAINT: CSSObject = {
  color: 'text.primary',
  letterSpacing: kkTokens.type.tracking.display,
  lineHeight: 1.1,
};

interface KkDensePanelStampProps {
  eyebrow?: string;
  eyebrowTone: KkStampTone;
  time: string;
  live?: boolean;
}

export const KkDensePanelStamp: FC<KkDensePanelStampProps> = ({
  eyebrow = NO_EYEBROW,
  eyebrowTone,
  time,
  live = false,
}) => (
  <Stack data-kk-dense-stamp sx={STAMP_FRAME}>
    <KkDensePanelStampEyebrow text={eyebrow} tone={eyebrowTone} live={live} />
    <Typography component="span" variant="h4" noWrap sx={TIME_PAINT}>
      {time}
    </Typography>
  </Stack>
);
