import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { SMALL_FIELD } from '../../stage-ink-density';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStageInkCountProps {
  count: number;
}

export const KkStageInkCount: FC<KkStageInkCountProps> = ({ count }) => (
  <Typography
    component="span"
    variant="caption"
    aria-hidden
    data-kk-stage-count
    sx={(theme) => ({
      width: '1.25rem',
      height: '1.25rem',
      display: 'grid',
      placeItems: 'center',
      borderRadius: '50%',
      fontWeight: 800,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
      color: palette(theme).primary.main,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).primary.main}`,
      [SMALL_FIELD]: { display: 'none' },
    })}
  >
    {count}
  </Typography>
);
