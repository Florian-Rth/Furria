import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { SMALL_FIELD } from '../../stage-ink-density';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStageInkNameProps {
  name: string;
  absent: boolean;
}

export const KkStageInkName: FC<KkStageInkNameProps> = ({ name, absent }) => (
  <Typography
    component="span"
    variant="caption"
    data-kk-stage-name
    noWrap
    sx={(theme) => ({
      display: 'block',
      maxWidth: 'min(4rem, 13cqw)',
      px: 0.5,
      lineHeight: 1.2,
      fontWeight: 800,
      borderRadius: `${kkTokens.radius.pill}px`,
      backgroundColor: `color-mix(in srgb, ${palette(theme).background.default} 70%, transparent)`,
      color: absent ? palette(theme).warning.main : palette(theme).text.primary,
      textDecoration: absent ? 'line-through' : 'none',
      [SMALL_FIELD]: { display: 'none' },
    })}
  >
    {name}
  </Typography>
);
