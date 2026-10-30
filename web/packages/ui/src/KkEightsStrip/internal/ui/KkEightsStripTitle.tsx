import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsStripTitleProps {
  eyebrow: string;
  number: string | null;
  title: string;
  meta: string;
  level?: 'h1' | 'h2';
}

export const KkEightsStripTitle: FC<KkEightsStripTitleProps> = ({
  eyebrow,
  number,
  title,
  meta,
  level = 'h2',
}) => {
  const lead =
    number === null ? null : (
      <Typography
        component="span"
        variant="h3"
        sx={(theme) => ({
          fontVariantNumeric: 'tabular-nums',
          color: palette(theme).primary.main,
          lineHeight: 1,
        })}
      >
        {number}
      </Typography>
    );

  return (
    <Stack sx={{ gap: 0.25, minWidth: 0 }}>
      <Typography
        variant="overline"
        sx={(theme) => ({
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.type.tracking.label,
          lineHeight: 1.2,
          color: palette(theme).text.secondary,
        })}
      >
        {eyebrow}
      </Typography>
      <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.75, minWidth: 0 }}>
        {lead}
        <Typography
          component={level}
          variant="h3"
          sx={{
            minWidth: 0,
            lineHeight: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
      </Stack>
      <Typography
        variant="caption"
        sx={(theme) => ({
          fontVariantNumeric: 'tabular-nums',
          color: palette(theme).text.secondary,
          lineHeight: 1.3,
        })}
      >
        {meta}
      </Typography>
    </Stack>
  );
};
